/*globals window, define*/
(function () {
   var factory = function (ko) {
      var create = function (initialValue, underlyingDatabaseValue, validatorFunction, isDeleted, onValueChanged) {
         var databaseValue = ko.observable(underlyingDatabaseValue),
         currentValue = ko.observable(initialValue),
         errorMessage = ko.observable(""),
         isDirty = ko.computed(function () {
            var returnValue;
            if (currentValue() !== databaseValue()) {
               returnValue = true;
            }
            else {
               returnValue = false;
            }
            return returnValue;
         }),
         isValid = ko.computed(function () {
            var isValidData, returnValue;

            if (validatorFunction === null || validatorFunction === undefined) {
               return true;
            }
            else {
               isValidData = validatorFunction(currentValue());

               if (isValidData === true || isValidData === false) {
                  returnValue = isValidData;
                  errorMessage("");
               }
               else {
                  returnValue = isValidData.isValid;
                  errorMessage(isValidData.errorMessage);
               }
               return returnValue;
            }
         }),
         setDatabaseValue = function (newValue, updateCurrentValue) {
            //if we overwrite the current value as well
            if (updateCurrentValue === true) {
               currentValue(newValue);
            }

            //setting the database value will cause isDirty to re-evaluate
            databaseValue(newValue);

            //sometimes after a database update we need to notify that something has changed in order to update or save
            if (isDirty() === true) {
               if (onValueChanged !== undefined) {
                  onValueChanged(currentValue());
               }
            }
         },
         setDatabaseValueToCurrent = function () {
            databaseValue(currentValue());
         },
         revertToDatabaseValue = function () {
            //set the currentValue back to the database value
            //this is used for such cases as a cancel of an edit
            currentValue(databaseValue());
         },
         currentValueSubscription = null,
         setValueChangedCallback = function (newValue) {
            if (onValueChanged !== undefined) {
               currentValueSubscription.dispose();
               currentValueSubscription = null;
            }

            onValueChanged = newValue;

            if (onValueChanged !== undefined) {
               currentValueSubscription = currentValue.subscribe(function (val) {
                  onValueChanged(val);
               });
            }
         },
         destroy = function () {
            if (currentValueSubscription !== null) {
               currentValueSubscription.dispose();
            }
         };

         //if an explicit callback is passed in we will fire the
         //callback whenever the current value changes
         if (onValueChanged !== undefined) {
            currentValueSubscription = currentValue.subscribe(function (newValue) {
               onValueChanged(newValue);
            });
         }


         return {
            isDeleted: isDeleted,
            value: currentValue,
            isDirty: isDirty,
            isValid: isValid,
            errorMessage: errorMessage,
            setDatabaseValue: setDatabaseValue,
            setDatabaseValueToCurrent: setDatabaseValueToCurrent,
            revertToDatabaseValue: revertToDatabaseValue,
            setValueChangedCallback: setValueChangedCallback,
            destroy: destroy
         };
      };

      return {
         create: create
      };
   };

   if (typeof define === "function" && define.amd) {
      define("SimpleFieldFactory", ["knockout"], function (knockout) {
         return factory(knockout);
      });
   }
   else {
      window.SimpleFieldFactory = factory(ko);
   }
})();
