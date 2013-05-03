/*globals define*/
(function () {
   var factory = function () {
      var create = function (isRequired, description, optionalNullObject) {

         if (isRequired !== true && isRequired !== false) {
            throw new Error(isRequired + " is not a valid value for " + description);
         }

         return function (enteredValue) {
            var isValid, errorMessage;

            if (isRequired === false) {
               isValid = true;
               errorMessage = "";
            }
            else if (enteredValue === null || enteredValue === undefined || enteredValue === optionalNullObject) {
               isValid = false;
               errorMessage = description + " cannot be blank";
            }
            else {
               isValid = true;
               errorMessage = "";
            }

            return {
               isValid: isValid,
               errorMessage: errorMessage
            };
         };
      };

      return {
         create: create
      };
   };

   if (typeof define === "function" && define.amd) {
      define("ObjectValidatorFactory", [], function () {
         return factory();
      });
   }
   else {
      window.ObjectValidatorFactory = factory();
   }
})();