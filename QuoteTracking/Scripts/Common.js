(function () {
    Quote.factory("Common", function ($uibModal, $http) {

        var _objCommon = {};

        /******************************************************************************
            Constant values for customized message for respective popup or toaster
        ******************************************************************************/
        _objCommon.SUCCESSMSG = "New quote '{0}' added successfully";
        _objCommon.UPDATEMSG = "Quote '{0}' updated successfully";
        _objCommon.REQUOTEMSG = "Quote '{0}' requoted successfully";
        _objCommon.DELETEMSG = "Quote '{0}' deleted successfully";        
        _objCommon.DATEERRORMSG = "Please check your given date";
        _objCommon.NOCHANGEMSG = "No changes to save";
        _objCommon.SELECTQUOTEMSG = "Please select any quote to update";
        _objCommon.SELECTDELETEMSG = "Please select any quote to delete";
        _objCommon.DATEFILTERCHECKMSG = "Please check estimate date";
        _objCommon.DATEFILTERMSG = "'From date' should be earlier or equal to 'To date'";
        _objCommon.DELETECONFIRMRMSG = "Are you sure want to delete Quote - ";
        _objCommon.REQUOTEDENYMSG = "'Approved' or 'On Hold' quote cannot be Re-Quote";
        _objCommon.REQUIREDERRORMSG = "Please enter required fields";
        _objCommon.CANCELCONFIRMMSG = "You have unsaved data. Do you want to save your changes?";
        _objCommon.NOTAPPLICABLEMSG = "Requisition,PO and Invoice details are not applicable";
        _objCommon.ESTCONDITIONMSG = "Estimated Hours must be less than or equal to '9999'";
        _objCommon.REQCHECKMSG = "Please enter Requisition number";
        _objCommon.PODATECHECKMSG = "Please enter PO date";
        _objCommon.INVOICEDATECHECKMSG = "Please enter invoice date";
        _objCommon.POCHECKMSG = "Please enter PO number";
        _objCommon.POCONDITIONMSG = "PO date cannot be earlier than requsition date";
        _objCommon.INVOICECHECKMSG = "Please enter invoice number";
        _objCommon.INVOICECONDITIONMSG = "Invoice date cannot be earlier than PO date";
        _objCommon.REMOVEATTACHCONFIRMMSG = "Are you sure want to remove selected attachment(s)";
        _objCommon.SELECTATTACHMSG = "Please select any attachment(s) to remove";
        _objCommon.REQDATECONDITIONMSG = "Requisition date cannot be earlier than estimate date";
        _objCommon.DOWNLOADATTACHFAILMSG = "Newly added file cannot be download";

        /********************************************************
            Name: DateCellRendere
            Description: To set date format for search on dates
        *********************************************************/
        _objCommon.DateCellRenderer = function (objParam) {
            var sDate = _objCommon.FormatDate(objParam.value);

            return _objCommon.HighlightSearchText(_objCommon.SearchText, sDate);
        };
                
        /******************************************************
            Name: TextCellRenderer
            Description: To set text for search on text
        ******************************************************/
        _objCommon.TextCellRenderer = function (objParam) {

            return _objCommon.HighlightSearchText(_objCommon.SearchText, objParam.value);
        };

        /*******************************************************
            Name: HighlightSearchText
            Description: To highlight search result text
        *******************************************************/
        _objCommon.HighlightSearchText = function (sSearchText, sValue) {
            if (!sSearchText)
            {
                return sValue;
            }

            sValue = sValue != null ? sValue.toString() : "";

            return sValue.replace(new RegExp(sSearchText, 'gi'), '<span class="scHighlightedText">$&</span>');
        };

        /*******************************************************************
            Name: ValidateForm
            Description: To validate form of modal on add/update qoute
        ********************************************************************/
        _objCommon.ValidateForm = function (objForm) {
            var bIsValid = true;
            var sMsg = "";

            if (objForm != null)
            {
                var aError = null;

                _objCommon.RemoveErrorStyleClass(objForm);

                if (objForm.$error.hasOwnProperty("required"))
                {
                    aError = objForm.$error.required;
                    sMsg = _objCommon.REQUIREDERRORMSG;
                }

                else if (objForm.$error.hasOwnProperty("required"))
                {
                    aError = objForm.$error.required;
                    sMsg = _objCommon.DATEERRORMSG;
                }

                if (aError != null && aError.length > 0)
                {

                    bIsValid = false;

                    for (var iIndex = 0; iIndex < aError.length; iIndex++) {
                        var objError = aError[iIndex];

                        if (objError != null)
                        {
                            var aElement = angular.element(document.getElementsByName(objError.$name));

                            if (aElement != null && aElement.length > 0)
                            {
                                var objElement = aElement[0];
                                var sClassName = objElement.className;

                                if (iIndex == 0)
                                {
                                    objElement.focus();
                                }

                                objElement.className = sClassName + " scHasError";
                            }
                        }
                    }
                }
            }

            return { IsValid: bIsValid, ErrorMsg: sMsg };
        };

        /************************************************************************
            Name: RemoveErrorStyleClass
            Description: To replace customized style class for error element
        ************************************************************************/
        _objCommon.RemoveErrorStyleClass = function (objForm) {
            angular.forEach(objForm, function (element, name) {

                if (name != null && name.indexOf('$') != 0)
                {
                    var objChild = angular.element(document.getElementsByName(element.$name))[0];

                    if (objChild != null)
                    {
                        var sClassName = objChild.className;

                        if (sClassName != null)
                        {
                            sClassName = sClassName.replace(new RegExp("scHasError", 'g'), "");

                            objChild.className = sClassName;
                        }
                    }
                }
            });
        };
        
        /***********************************************************************
            Name: FormatDate
            Description: To format date object from ui datepicker into date
        ***********************************************************************/
        _objCommon.FormatDate = function (objDate, sDateFormat)
        {
            if (objDate != null) {
                var dtFormatValue = new Date(objDate);
                var iDay = dtFormatValue.getDate();
                var iMonth = dtFormatValue.getMonth() + 1; //As January is 0.
                var iYear = dtFormatValue.getFullYear();

                if (iDay < 10)
                {
                    iDay = '0' + iDay;
                }

                if (iMonth < 10)
                {
                    iMonth = '0' + iMonth;
                }

                if (sDateFormat === "yyyy-mm-dd")
                {
                    return (iYear + "-" + iMonth + "-" + iDay);
                }

                else
                {
                    return (iDay + "/" + iMonth + "/" + iYear);
                }
            }

            return "";
        };

        /************************************************
            Name: AlertPopUp
            Description: Ui modal popup for Alert 
        ************************************************/
        _objCommon.AlertPopUp = function (sMsg) {

            var objModalInstance = $uibModal.open({

                templateUrl: "Views/AlertPopUp.html",
                controller: function ($scope, $uibModalInstance, AlertOption) {

                    $scope.CloseMessagePopup = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    $scope.Message = AlertOption.Message;
                },
                backdrop: "static",
                windowClass: "OpenModelCenter",
                resolve: {
                    AlertOption: function () {
                        return { "Message": sMsg };
                    }
                }
            }).result.catch(function (res) {

                if ((res === 'cancel' || res === '   key press'))
                {
                    return "";
                }
            });
        };

        /******************************************************
            Name: ConfirmPopUp
            Description: Ui modal popup for confirmation
        *******************************************************/
        _objCommon.ConfirmPopUp = function (sMsg, fnDeleteQuote) {
            var objModalInstance = $uibModal.open({

                templateUrl: "Views/ConfirmPopUp.html",
                controller: function ($scope, $uibModalInstance, ConfirmOption) {
                    $scope.Ok = function () {
                        $uibModalInstance.dismiss('Ok');
                    };
                    $scope.Cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    $scope.Message = ConfirmOption.Message;
                },
                backdrop: "static",
                windowClass: "OpenModelCenter",
                resolve: {
                    ConfirmOption: function () {

                        return {
                            "Message": sMsg
                        };
                    }
                }
            }).result.catch(function (res) {

                if (res === 'Ok')
                {
                    fnDeleteQuote();
                }

                if ((res === 'cancel' || res === 'escape key press'))
                {
                    return "";
                }

            });
        };

        /**************************************************************************************************
            Name: SaveConfirmPopUp
            Description: Ui modal popup for Save confimation when modal closed without saved changes
        **************************************************************************************************/
        _objCommon.SaveConfirmPopUp = function (sMsg, fnSave, fnClose) {
            var objModalInstance = $uibModal.open({

                templateUrl: "Views/SaveConfirmPopUp.html",
                controller: function ($scope, $uibModalInstance, ConfirmOption) {
                    $scope.Save = function () {
                        $uibModalInstance.dismiss('Save');
                    };

                    $scope.CancelSave = function () {
                        $uibModalInstance.dismiss('Close');
                    };

                    $scope.Cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    $scope.Message = ConfirmOption.Message;
                },
                backdrop: "static",
                windowClass: "OpenModelCenter",
                resolve: {
                    ConfirmOption: function () {

                        return {
                            "Message": sMsg
                        };
                    }
                }
            }).result.catch(function (res) {

                if (res === 'Save')
                {
                    fnSave();
                }

                if (res == 'Close')
                {
                    fnClose();
                }

                if ((res === 'cancel' || res === 'escape key press'))
                {
                    return "";
                }
            });
        };
                
        return _objCommon;
    });
})();