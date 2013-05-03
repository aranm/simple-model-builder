/*globals define*/
(function () {
   var factory = function() {
      var create = function(maximumLength, hasMaximumLength, isMandatory, description) {

         if (hasMaximumLength !== true && hasMaximumLength !== false) {
            throw new Error(hasMaximumLength + " is not a valid value for " + description);
         }
         if (isMandatory !== true && isMandatory !== false) {
            throw new Error(isMandatory + " is not a valid value for " + description);
         }

         return function(enteredValue) {
            var isValid, errorMessage;

            if (hasMaximumLength === false) {
               if (enteredValue.length === 0 && isMandatory === true) {
                  isValid = false;
                  errorMessage = description + " cannot be blank";
               }
               else {
                  isValid = true;
                  errorMessage = "";
               }
            }
            else {
               if (enteredValue.length === 0 && isMandatory === true) {
                  isValid = false;
                  errorMessage = description + " cannot be blank";
               }
               else if (enteredValue.length > maximumLength) {
                  isValid = false;
                  errorMessage = description + " must not be longer than " + maximumLength;
                  if (maximumLength === 1) {
                     errorMessage += " character";
                  }
                  else {
                     errorMessage += " characters";
                  }
               }
               else {
                  isValid = true;
                  errorMessage = "";
               }
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
      define("StringLengthValidatorFactory", [], function () {
         return factory();
      });
   }
   else {
      window.StringLengthValidatorFactory = factory();
   }
})();