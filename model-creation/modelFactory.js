/*globals window, define, SimpleFieldFactory*/
(function () {
   var factory = function (ko, simpleFieldFactory) {

      var createField = function(fieldData) {
         var newField = simpleFieldFactory.create(fieldData.initialValue, fieldData.databaseValue, fieldData.validator, false, fieldData.valueChanged);
         
         //add any other fields that exist on the fieldData
         for (var prop in fieldData) {
            if (prop === "initialValue" || prop === "databaseValue" || prop === "validator" || prop === "valueChanged") { }
            else if (newField.hasOwnProperty(prop)) {
               //We can't add a field that might overwrite one of the simpleField's field's
               throw new Error("Field already has the property " + prop);
            }
            else if (fieldData.hasOwnProperty(prop)) {
               newField[prop] = fieldData[prop];
            }
         }

         return newField;
      },
      addField = function(viewModel, simpleField, propertyName) {
         viewModel[propertyName] = simpleField.value;
         viewModel[propertyName + "Field"] = simpleField;
      };

      var create = function (dataFields) {
         var i,
            allFields = ko.observableArray(),
            arrayLength = dataFields.length,
            newViewModel = {};
         
         for (i = 0; i < arrayLength; i++) {
            var fieldDefinition = dataFields[i],
            newField = createField(fieldDefinition);
            
            allFields.push(newField);
            addField(newViewModel, newField, fieldDefinition.propertyName);
         }

         newViewModel.isDirty = ko.computed(function () {
            var isDirty = false;
            ko.utils.arrayForEach(allFields(), function (field) {
               if (field.isDirty() === true) {
                  isDirty = true;
               }
            });
            return isDirty;
         });

         newViewModel.isValid = ko.computed(function () {
            var isValid = true;
            ko.utils.arrayForEach(allFields(), function (field) {
               if (field.isValid() === false) {
                  isValid = false;
               }
            });
            return isValid;
         });
      };

      return {
         create: create
      };
   };

   if (typeof define === "function" && define.amd) {
      define("ModelFactory", ["ko", "SimpleFieldFactory"], function (ko, simpleFieldFactory) {
         return factory(ko, simpleFieldFactory);
      });
   }
   else {
      window.ModelFactory = factory(ko, SimpleFieldFactory);
   }
})();
