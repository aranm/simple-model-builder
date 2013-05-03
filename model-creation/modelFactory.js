/*globals window, define, SimpleFieldFactory*/
(function () {
   var factory = function (ko, simpleFieldFactory) {

      var createField = function (fieldData) {
         if (fieldData.databaseValue === undefined) {
            fieldData.databaseValue = fieldData.initialValue;
         }
         
         var newField = simpleFieldFactory.create(fieldData.initialValue, fieldData.databaseValue, fieldData.validator, false, fieldData.valueChanged);

         //add any other fields that exist on the fieldData as fields on the simple field
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
      addField = function (viewModel, simpleField, propertyName) {
         if (viewModel[propertyName] !== undefined || viewModel[propertyName + "Field"] !== undefined) {
            throw new Error("Duplicate property detected " + propertyName);
         }
         viewModel[propertyName] = simpleField.value;
         viewModel[propertyName + "Field"] = simpleField;
      },
      addModel = function (viewModel, subModelDefinition) {
         if (viewModel[subModelDefinition.propertyName] !== undefined) {
            throw new Error("Duplicate property detected " + subModelDefinition.propertyName);
         }
         viewModel[subModelDefinition.propertyName] = subModelDefinition.model;
      },
      addArrayModel = function (viewModel, subModelArrayDefinition) {
         if (viewModel[subModelArrayDefinition.propertyName] !== undefined) {
            throw new Error("Duplicate property detected " + subModelArrayDefinition.propertyName);
         }
         viewModel[subModelArrayDefinition.propertyName] = subModelArrayDefinition.value;
      };

      var create = function (data) {
         var i,
            allFields = ko.observableArray(),
            allSubModels = ko.observableArray(),
            allSubArraysOfModels = ko.observableArray(),
            arrayLength = data.fields.length,
            subModelPropertyLength = 0,
            subModelArraysLength = 0,
            newViewModel = {};
         
         //deal with the fields
         for (i = 0; i < arrayLength; i++) {
            var fieldDefinition = data.fields[i],
            newField = createField(fieldDefinition);
            addField(newViewModel, newField, fieldDefinition.propertyName);
            
            allFields.push(newField);
         }
         
         //deal with any sub model properties (properties that are models created by this model factory)
         if (data.subModelProperties !== undefined) {
            subModelPropertyLength = data.subModelProperties.length;

            for (i = 0; i < subModelPropertyLength; i++) {
               var subModelDefinition = data.subModelProperties[i];
               addModel(newViewModel, subModelDefinition);
               allSubModels.push(subModelDefinition.model);
            }
         }

         //deal with any observable arrays of models (an array of models created by this model factory)
         if (data.arrayModelProperties !== undefined) {
            subModelArraysLength = data.arrayModelProperties.length;

            for (i = 0; i < subModelArraysLength; i++) {
               var subModelArrayDefinition = data.arrayModelProperties[i];
               addArrayModel(newViewModel, subModelArrayDefinition);
               allSubArraysOfModels.push(subModelArrayDefinition.value);
            }
         }

         //add any other properties that exist on the data as properties on the view model
         for (var prop in data) {
            if (prop === "fields" || prop === "subModelProperties" || prop === "subModelArray") { }
            else if (newViewModel.hasOwnProperty(prop)) {
               //We can't add a field that might overwrite one of the view model's fields
               throw new Error("View model already has the property " + prop);
            }
            else if (data.hasOwnProperty(prop)) {
               newViewModel[prop] = data[prop];
            }
         }
         
         //now add the computed functions
         newViewModel.isDirty = ko.computed(function () {
            var isDirty = false;
            ko.utils.arrayForEach(allFields(), function (field) {
               if (field.isDirty() === true) {
                  isDirty = true;
               }
            });
            ko.utils.arrayForEach(allSubModels(), function (subModel) {
               if (subModel.isDirty() === true) {
                  isDirty = true;
               }
            });
            ko.utils.arrayForEach(allSubArraysOfModels(), function (subModelArray) {
               ko.utils.arrayForEach(subModelArray(), function (subModel) {
                  if (subModel.isDirty() === true) {
                     isDirty = true;
                  }
               });
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
            ko.utils.arrayForEach(allSubModels(), function (subModel) {
               if (subModel.isValid() === false) {
                  isValid = false;
               }
            });
            ko.utils.arrayForEach(allSubArraysOfModels(), function (subModelArray) {
               ko.utils.arrayForEach(subModelArray(), function (subModel) {
                  if (subModel.isValid() === false) {
                     isValid = false;
                  }
               });
            });
            return isValid;
         });

         newViewModel.cancelEdit = function () {
            //revert any simple fields
            ko.utils.arrayForEach(allFields(), function (field) {
               field.revertToDatabaseValue();
            });
            
            //revert all sub models
            ko.utils.arrayForEach(allSubModels(), function (subModel) {
               subModel.cancelEdit();
            });
            
            //revert any models of sub arrays
            ko.utils.arrayForEach(allSubArraysOfModels(), function (subModelArray) {
               ko.utils.arrayForEach(subModelArray(), function (subModel) {
                  subModel.cancelEdit();
               });
            });
         };
         

         return newViewModel;
      };

      return {
         create: create
      };
   };

   if (typeof define === "function" && define.amd) {
      define("ModelFactory", ["knockout", "SimpleFieldFactory"], function (ko, simpleFieldFactory) {
         return factory(ko, simpleFieldFactory);
      });
   }
   else {
      window.ModelFactory = factory(ko, SimpleFieldFactory);
   }
})();
