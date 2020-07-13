(function () {
    Quote.controller("AddEditQuoteController", function ($rootScope, $scope, $http, $uibModalInstance, $window, $timeout, QuoteParam, Common, Toaster) {

        $scope.ShowBrowseLabel = true;        
        $scope.MessageBoxOverlay = false;
        $scope.EstimatedDatePopup = false;
        $scope.RequisitiondatePopup = false;
        $scope.PoReceivedeDatePopup = false;
        $scope.InvoiceDatePopup = false;
        $scope.DeleteFileNames = [];
        $scope.CurrentSelectedFiles = [];
        $scope.Quote = { QuoteNumber: -1, Attachments: [] };       
        
        /*****************************************************
            Name: OpenDate
            Description: To set Ui - datepicker Open/Close
        ******************************************************/
        $scope.OpenDate = function (sDatePicker) {

            switch (sDatePicker) {
                case 'EST': $scope.EstimatedDatePopup = true;
                    break;
                case 'RST': $scope.RequisitiondatePopup = true;
                    break;
                case 'PO': $scope.PoReceivedeDatePopup = true;
                    break;
                case 'INV': $scope.InvoiceDatePopup = true;
                    break;
            }
        };               

        /*************************************************************
            Name: SetFocus
            Description: To set customized focus on element by 'id'
        **************************************************************/
        $scope.SetFocus = function (sId) {
            $timeout(function () {
                var objElement = document.getElementById(sId);

                if (objElement)
                {
                    objElement.focus();
                }
            });
        };

        /**********************************************
             Name: Close
             Description: To dismiss modal 
        ***********************************************/
        $scope.Close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        /************************************************************
            Name: CancelModal
            Description: To close modal on click 'cancel' button
        *************************************************************/
        $scope.CancelModal = function () {
            if ($scope.frmQuote.$dirty == false)
            {
                $uibModalInstance.close('cancel');
            }
            else
            {
                Common.SaveConfirmPopUp(Common.CANCELCONFIRMMSG, $scope.Save, $scope.Close);
            }
        };        

        /********************************************************
            Name: InitQuote
            Description: Initialize default model properties
        ********************************************************/
        $scope.InitQuote = function () {

            $timeout(function () {
                $scope.InitDropzone();
            });

            //Master call            
            $scope.Loading = true;

            $http.get("api/QuoteMaster").then(function (objResponse) {

                $scope.QuoteStatusOptions = objResponse.data.MasterQuoteStatus;
                $scope.DepartmentOptions = objResponse.data.MasterDepartments;
                $scope.POStatusOptions = objResponse.data.MasterPOStatus;
                $scope.InvoiceStatusOptions = objResponse.data.MasterInvoiceStatus;
                $scope.UserDetailsOPtions = objResponse.data.MasterUserDetails;
                $scope.Loading = false;

            }).then(function () {

                // On modal open by click 'Add' button
                if (QuoteParam.Mode.toUpperCase() === "ADD")
                {
                    $scope.ModalTitle = 'Add Quote';
                    $scope.Quote.QuoteStatusCode = "NEW";
                    $scope.DisabledOnOpen = true;
                    $scope.DisabledOnNew = true;
                    $scope.RequiredOnAdd = true;
                    $scope.DisabledRequisition = true;
                    $scope.SetFocus("cmbDepartment");                     
                    $scope.Quote.EstimatedDate = new Date();
                }

                // On modal open by click 'Re-Quote' button
                if (QuoteParam.Mode.toUpperCase() === "REQUOTE")
                {
                    var sQuoteUrl = "api/Quote/" + QuoteParam.QuoteNumber;

                    $scope.Quote.QuoteNumber = QuoteParam.QuoteNumber;                    
                    $scope.ModalTitle = 'Re-Quote' + ' - ' + QuoteParam.QuoteNumber;
                    $scope.Loading = true;
                    
                    $http.get(sQuoteUrl).then(function (objResponse) {

                        objResponse.data.EstimatedDate = objResponse.data.EstimatedDate != null ? new Date(objResponse.data.EstimatedDate) : objResponse.data.EstimatedDate;
                        objResponse.data.RequisitionDate = objResponse.data.RequisitionDate != null ? new Date(objResponse.data.RequisitionDate) : objResponse.data.RequisitionDate;
                        objResponse.data.PODate = objResponse.data.PODate != null ? new Date(objResponse.data.PODate) : objResponse.data.PODate;
                        objResponse.data.InvoiceDate = objResponse.data.InvoiceDate != null ? new Date(objResponse.data.InvoiceDate) : objResponse.data.InvoiceDate;

                        $scope.Quote = objResponse.data;                        
                        objResponse.data.QuoteStatusCode = "RVD";
                        $scope.Loading = false;
                    });

                    $scope.DisabledOnOpen = true;
                    $scope.DisabledOnNew = true;
                    $scope.RequiredOnAdd = true;
                    $scope.DisabledRequisition = true;
                    $scope.SetFocus("cmbDepartment");
                }

                // On modal open by click 'Edit' button
                if (QuoteParam.Mode.toUpperCase() === "EDIT")
                {
                    var sQuoteUrl = "api/Quote/" + QuoteParam.QuoteNumber;

                    $scope.Quote.QuoteNumber = QuoteParam.QuoteNumber;
                    $scope.ModalTitle = 'Edit Quote' + ' - ' + QuoteParam.QuoteNumber;
                    $scope.Loading = true;

                    $http.get(sQuoteUrl).then(function (objResponse) {
                        objResponse.data.EstimatedDate = objResponse.data.EstimatedDate != null ? new Date(objResponse.data.EstimatedDate) : objResponse.data.EstimatedDate;
                        objResponse.data.RequisitionDate = objResponse.data.RequisitionDate != null ? new Date(objResponse.data.RequisitionDate) : objResponse.data.RequisitionDate;
                        objResponse.data.PODate = objResponse.data.PODate != null ? new Date(objResponse.data.PODate) : objResponse.data.PODate;
                        objResponse.data.InvoiceDate = objResponse.data.InvoiceDate != null ? new Date(objResponse.data.InvoiceDate) : objResponse.data.InvoiceDate;

                        $scope.Quote = objResponse.data;
                        $scope.ShowBrowseLabel = $scope.ShowHideBrowseLabel();

                        //to set customized actions on modal open with quote status 'approved'
                        if ($scope.Quote.QuoteStatusCode == "APD")
                        {
                            $scope.DisabledOnOpen = true;
                            $scope.SetFocus("txtReqNum");
                        }

                        $scope.EnableDisableFormInput();                        
                        $scope.Loading = false;

                    }).then(function () {

                        // To set customized data on quote status options on modal open with quote status options 'On Hold' or 'New'
                        if ($scope.Quote.QuoteStatusCode === "OHD" || $scope.Quote.QuoteStatusCode === "NEW")
                        {
                            for (var i = 0; i < $scope.QuoteStatusOptions.length; i++) {
                                if ($scope.QuoteStatusOptions[i].QuoteStatusCode === "RVD") {
                                    $scope.QuoteStatusOptions.splice(i, 1);
                                }
                            }
                            $scope.Loading = false;
                        }

                        // To set customized data on quote status options on modal open with quote status options 'Revised'
                        if ($scope.Quote.QuoteStatusCode === "RVD")
                        {
                            for (var i = 0; i < $scope.QuoteStatusOptions.length; i++) {
                                if ($scope.QuoteStatusOptions[i].QuoteStatusCode === "NEW")
                                {
                                    $scope.QuoteStatusOptions.splice(i, 1);
                                }
                            }
                        }
                    });
                }

                $scope.Loading = false;
            });            
        };

        /*********************************************************************************
            Name: OnChangeQuoteStatus
            Description: To set customized actions and values on quotes status changed
        *********************************************************************************/
        $scope.OnChangeQuoteStatus = function () {
            if ($scope.Quote.QuoteStatusCode == "APD") {
                $scope.Quote.POStatusCode = "WPO";
                $scope.Quote.InvoiceStatusCode = "TIP";
            }
            else {
                $scope.Quote.POStatusCode = "";
                $scope.Quote.InvoiceStatusCode = "";
            }

            $scope.EnableDisableFormInput();
        };

        /*********************************************************************************
            Name: EnableDisableFormInput
            Description: To set customized actions and values on quotes status changed
        ***********************************************************************************/
        $scope.EnableDisableFormInput = function () {
           
            if ($scope.Quote.QuoteStatusCode == "APD")
            {

                $scope.DisabledOnNew = false;                
                $scope.DisabledRequisition = false;
                $scope.DisabledOnApproved = true;
                $scope.RequiredOnApproved = true;                
            }

            else
            {

                $scope.Quote.POStatusCode = $scope.Quote.POStatusCode;
                $scope.Quote.InvoiceStatusCode = $scope.Quote.InvoiceStatusCode;
                $scope.RequiredOnApproved = false;
                $scope.DisabledOnApproved = false;
                $scope.Quote.POStatusCode = "";
                $scope.Quote.InvoiceStatusCode = "";

                if ($scope.Quote.QuoteStatusCode === "OHD" || $scope.Quote.QuoteStatusCode === "NEW" || $scope.Quote.QuoteStatusCode === "RVD")
                {
                    $scope.DisabledRequisition = true;
                    $scope.DisabledOnNew = true;                    
                }                
            }
        };
        
        /********************************************************************
            Name: DownloadAttachment
            Description: To download attachment file
        *********************************************************************/
        $scope.DownloadAttachment = function (sFilename, sAttachmentStatus) {

            var iQuoteNumber = $scope.Quote.QuoteNumber;
            var aSplitArray = sFilename.split(".");
            var sQuoteUrl = "api/DownloadAttachment/" + iQuoteNumber + "/" + aSplitArray[0] + "/" + aSplitArray[1];
            var objDownload = document.getElementById("aDownload");
            
            //To check attachment status to prevent downloading undownloaded files
            if (sAttachmentStatus == "N")
            {
                Common.AlertPopUp(Common.DOWNLOADATTACHFAILMSG);

                return false;
            }            

            objDownload.href = sQuoteUrl;
            objDownload.click();
        };

        /*********************************************
            Name: Save
            Description: To add or update quote
        **********************************************/
        $scope.Save = function () {
            var objQuoteCopy = angular.copy($scope.Quote);
            var objFormValidation = Common.ValidateForm($scope.frmQuote);

            // To check the form is valid or not
            if (objFormValidation.IsValid == true)
            {
                // To check the modal is opened for upadte
                if (QuoteParam.Mode.toUpperCase() === "EDIT" || QuoteParam.Mode.toUpperCase() === "REQUOTE")
                {
                    // To check the form is modified or not
                    if ($scope.frmQuote.$dirty == false || $scope.AddAttachment.value == "")
                    {
                        Toaster.pop("WARNING", Common.NOCHANGEMSG);

                        return false;
                    }
                }

                // To check quote status on modal open
                if (objQuoteCopy.QuoteStatusCode !== "APD")
                {
                    // validation of 'Estimated Hours
                    if (parseInt(objQuoteCopy.EstimatedHours) > 9999 || parseInt(objQuoteCopy.EstimatedHours) == 0)
                    {
                        Common.AlertPopUp(Common.ESTCONDITIONMSG);
                        $scope.SetFocus("txtEstHours")
                        return false;
                    }

                    // Validation of 'Requisition Number'
                    else if (objQuoteCopy.RequisitionNumber != null && objQuoteCopy.RequisitionNumber != "" || objQuoteCopy.RequisitionNumber == 0)
                    {
                        Common.AlertPopUp(Common.NOTAPPLICABLEMSG);
                        return false;
                    }

                    // Validation of 'PO Number'
                    else if (objQuoteCopy.PONumber != null && objQuoteCopy.PONumber != "" || objQuoteCopy.PONumber == 0)
                    {
                        Common.AlertPopUp(Common.NOTAPPLICABLEMSG);
                        return false;
                    }

                    //Validation of 'Invoice Number'
                    else if (objQuoteCopy.InvoiceNumber != null && objQuoteCopy.InvoiceNumber != "" || objQuoteCopy.InvoiceNumber == 0)
                    {
                        Common.AlertPopUp(Common.NOTAPPLICABLEMSG);
                        return false;
                    }

                    // Validation of 'PO Status' and 'Invoice Status'
                    if (objQuoteCopy.POStatusCode != null || objQuoteCopy.InvoiceStatusCode != null)
                    {

                        if (objQuoteCopy.POStatusCode != "" || objQuoteCopy.InvoiceStatusCode != "" || objQuoteCopy.RequisitionDate != null
                            || objQuoteCopy.PODate != null || objQuoteCopy.InvoiceDate != null)
                        {
                            Common.AlertPopUp(Common.NOTAPPLICABLEMSG);
                            return false;
                        }
                    }
                }
                else if (objQuoteCopy.QuoteStatusCode === "APD") // To check whether quoe status is 'Approved' on quote save
                {
                    // To check null for 'Requisition Number'
                    if (objQuoteCopy.RequisitionNumber == 0)
                    {
                        Common.AlertPopUp(Common.REQCHECKMSG);
                        return false;
                    }

                    // To check customized condition for 'Requisition Date'
                    if (objQuoteCopy.RequisitionDate < objQuoteCopy.EstimatedDate)
                    {
                        Common.AlertPopUp(Common.REQDATECONDITIONMSG);
                        return false;
                    }

                    // To check null for 'PO Date'
                    if (objQuoteCopy.PODate != null) {
                        if (objQuoteCopy.PONumber == null || objQuoteCopy.PONumber == "" || objQuoteCopy.PONumber == 0)
                        {
                            Common.AlertPopUp(Common.POCHECKMSG);
                            $scope.SetFocus("txtPONumber");
                            return false;                            
                        }

                        // To check customized condition for 'PO Date'
                        if (objQuoteCopy.PODate < objQuoteCopy.RequisitionDate)
                        {
                            Common.AlertPopUp(Common.POCONDITIONMSG);
                            return false;
                        }
                    }

                    
                    if (objQuoteCopy.InvoiceDate != null)
                    {

                        // To check null for 'Invioce Number'
                        if (objQuoteCopy.InvoiceNumber == null || objQuoteCopy.InvoiceNumber == "" || objQuoteCopy.InvoiceNumber == 0)
                        {
                            Common.AlertPopUp(Common.INVOICECHECKMSG);
                            $scope.SetFocus("txtInvoiceNumber");
                            return false;
                        }

                        // To check customized condition for 'Invioce Date'
                        if (objQuoteCopy.InvoiceDate < objQuoteCopy.PODate)
                        {
                            Common.AlertPopUp(Common.INVOICECONDITIONMSG);
                            return false;
                        }
                    }
                    
                    // To check null for 'PO Number'
                    if (objQuoteCopy.PONumber != null)
                    {
                        if (objQuoteCopy.PODate == null)
                        {
                            Common.AlertPopUp(Common.PODATECHECKMSG);
                            $scope.SetFocus("txtPODate");
                            return false;
                        }
                    }

                    // To check null for 'Invoice Number'
                    if (objQuoteCopy.InvoiceNumber != null)
                    {
                        if (objQuoteCopy.InvoiceDate == null)
                        {
                            Common.AlertPopUp(Common.INVOICEDATECHECKMSG);
                            $scope.SetFocus("txtInvoiceDate");
                            return false;
                        }
                    }
                    
                }

                // To check whether quoe status is 'Revised' on quote save
                if (objQuoteCopy.QuoteStatusCode === "RVD") {
                    objQuoteCopy.IsReQuote = true;
                }

                //Convertion of Date while quote save - Begin
                objQuoteCopy.EstimatedDate = Common.FormatDate(objQuoteCopy.EstimatedDate, "yyyy-mm-dd");
                objQuoteCopy.PODate = Common.FormatDate(objQuoteCopy.PODate, "yyyy-mm-dd");
                objQuoteCopy.InvoiceDate = Common.FormatDate(objQuoteCopy.InvoiceDate, "yyyy-mm-dd");
                objQuoteCopy.RequisitionDate = Common.FormatDate(objQuoteCopy.RequisitionDate, "yyyy-mm-dd");
                //Convertion of Date while quote save - End

                $scope.Loading = true;

                var payload = new FormData();

                for (var iIndex = 0; iIndex < $scope.Quote.Attachments.length; iIndex++) {
                    payload.append('file', $scope.Quote.Attachments[iIndex].FileContent);
                    delete objQuoteCopy.Attachments[iIndex].FileContent;
                }

                payload.append("quote", JSON.stringify(objQuoteCopy));

                $http({
                    method: "POST",
                    url: "api/Quote/PostSaveQuote",
                    data: payload,
                    headers: {
                        'Content-type': undefined
                    }
                }).then(function (objResponse) {
                    $uibModalInstance.dismiss(objResponse.data);
                    $scope.Loading = false;

                }, function (objErrorResponse) {
                    Common.AlertPopUp(objErrorResponse.data.ExceptionMessage);
                    $scope.Loading = false;

                });
            }
            else // When form is invalid
            {
                Common.AlertPopUp(objFormValidation.ErrorMsg);
            }
        };
	    
        /***************************************************************************************************
            NAme: ShowHideDragOverlay
            Description: To show a overlay on file attachment input when a file is dragged from local
        ***************************************************************************************************/
	    $scope.ShowOrHideDragOverlay = function (bShow) {
            document.getElementById("dvFileDragDropOverlay").style.display = bShow ? "block" : "none";
        };

        /******************************************************************
            NAme: InitDropZone
            Description: initiates when a attachement file is dropped
        *****************************************************************/
        $scope.InitDropzone = function () {
            var objDropZone = document.getElementById("dvDocumentContainer");

            // Event listener when a file is dragged
            objDropZone.addEventListener("dragenter", function () {
                event.preventDefault();
                event.stopPropagation();

                $scope.ShowOrHideDragOverlay(false);
            });

            // Event listener when a file is left fromn dragging
            objDropZone.addEventListener("dragleave", function () {
                event.preventDefault();
                event.stopPropagation();

                $scope.ShowOrHideDragOverlay(false);
            });

            // Event listener when a file is dragged over the attachment input
            objDropZone.addEventListener("dragover", function () {
                event.preventDefault();
                event.stopPropagation();

                $scope.ShowOrHideDragOverlay(true);
            });

            // Event listener when a file is dropped into the attachment input
            objDropZone.addEventListener("drop", function () {
                event.preventDefault();
                event.stopPropagation();

                $scope.ShowOrHideDragOverlay(false);

                document.innerHTML = navigator.userAgent;

                // To check whether the user using from 'chrome' browser or not
                if (navigator.userAgent.search("Chrome") != -1)
                {
                    var aFiles = [];
                    var objFileItem = event.dataTransfer;

                    for (var iIndex = 0; iIndex < objFileItem.items.length; iIndex++) {
                        
                        if (objFileItem.items[iIndex].webkitGetAsEntry().isFile == true)
                        {
                            aFiles.push(objFileItem);
                        }
                    }

                    $scope.HandleBrowseFile(aFiles);
                }

                // If the user uses other than 'Chrome' browser
                else
                {
                    $scope.HandleBrowseFile(event.dataTransfer.files);
                }
                
            });
        };

        /********************************************************************************************
            Name: AttachmentFilter
            Description: To check and return 'Attachment Status' of the inserted attachment file
        ********************************************************************************************/
        $scope.AttachmentFilter = function (objAttachment) {

            return objAttachment.AttachmentStatus === 'N' || objAttachment.AttachmentStatus === 'U';
        };

        /***************************************************************************
            Name: AddAttachment
            Description: To add attachment from local by clicking 'Browse' button
        ****************************************************************************/
        $scope.AddAttachment = function () {
            var objUploadFile = document.getElementById("txtUploadFile");

            objUploadFile.value = "";
            objUploadFile.click();
        };

        /*********************************************************************
            Name: DeleteAttachment
            Description: To delete attachment file form attachment input 
        **********************************************************************/
        $scope.DeleteAttachment = function () {
            if ($scope.CurrentSelectedFiles.length > 0)
            {
                for (var iIndex = 0; iIndex < $scope.CurrentSelectedFiles.length; iIndex++)
                {
                    var iFileIndex = $scope.FindItemIndex($scope.Quote.Attachments, "Name", $scope.CurrentSelectedFiles[iIndex].Name);

                    if (iFileIndex != -1)
                    {
                        var objFile = $scope.Quote.Attachments[iFileIndex];

                        if (objFile.AttachmentStatus === "U")
                        {
                            objFile.AttachmentStatus = "D";
                        }

                        else
                        {
                            $scope.Quote.Attachments.splice(iFileIndex, 1);
                        }
                    }
                }
            }

            $scope.frmQuote.$dirty = true;
            $scope.CurrentSelectedFiles = [];
            $scope.ShowBrowseLabel = $scope.ShowHideBrowseLabel();
        };

        /*********************************************************************************************
            Name: AttachementDeleteConfirmation
            Description: To show a confirmation popup on attachment delete from attachemnt input
        *********************************************************************************************/
        $scope.AttachmentDeleteConfirmation = function () {

            if ($scope.CurrentSelectedFiles.length > 0)
            {
                Common.ConfirmPopUp(Common.REMOVEATTACHCONFIRMMSG, $scope.DeleteAttachment);
            }

            else
            {
                Common.AlertPopUp(Common.SELECTATTACHMSG);
            }
        };

        /*********************************************************************
            Name: ShowHideBrowswLabel
            Description: To show/Hide 'Browse' label in attachement input 
        *********************************************************************/
        $scope.ShowHideBrowseLabel = function () {
            var aAttachments = $scope.Quote.Attachments;

            if (aAttachments != undefined)
            {
                for (var iIndex = 0; iIndex < aAttachments.length; iIndex++) {
                    if (aAttachments[iIndex].AttachmentStatus != "D")
                    {

                        return false;
                    }
                }
            }

            return true;
        };

        /******************************************************************************************
            Name: SelectCurrentyItem
            Description: To target a selected attachemnt file is selected from attachment input
        ******************************************************************************************/
        $scope.SelectCurrentItem = function (objEvent, sFileName) {
            event.preventDefault();
            event.stopPropagation();

            var objCurrentSelectedItem = objEvent.currentTarget;

            document.addEventListener("keydown", KeyCheck);
            function KeyCheck(event) {
                var iKeyID = event.keyCode;

                if (iKeyID == 46)
                {
                    $scope.AttachmentDeleteConfirmation();
                }                        
            }            

            if (objCurrentSelectedItem.classList.contains("SelectedFile"))
            {
                objCurrentSelectedItem.classList.remove("SelectedFile");

                var iFileIndex = $scope.FindItemIndex($scope.CurrentSelectedFiles, "Name", sFileName);

                if (iFileIndex != -1)
                {
                    $scope.CurrentSelectedFiles.splice(iFileIndex, 1);
                }
            }

            else
            {
                objCurrentSelectedItem.classList.add("SelectedFile");
                $scope.CurrentSelectedFiles.push({ Name: sFileName });
            }
        }

        /******************************************************************************************
            Name: FindItemIndex
            Description: To find the index of selected attachment file from attchements array
        *******************************************************************************************/
        $scope.FindItemIndex = function (aItemArray, sSearchField, sSearchValue) {
            var iIndex = -1;

            if (aItemArray != undefined)
            {
                for (var iIdx = 0; iIdx < aItemArray.length; iIdx++) {

                    if (aItemArray[iIdx][sSearchField].toUpperCase() === sSearchValue.toUpperCase())
                    {
                        iIndex = iIdx;
                    }
                }
            }

            return iIndex;
        };

        /***************************************************************************************************************
            Name: HandleBrowseFile
            Descrpiption: To handle actions when a attachement file is droppped//browsed into the attachement input
        ***************************************************************************************************************/
        $scope.HandleBrowseFile = function (aFiles) {
            for (var iIndex = 0; iIndex < aFiles.length; iIndex++) {

                if (aFiles.__proto__.constructor.name != "FileList")
                {
                    var objFile = aFiles[iIndex].files[iIndex];
                }

                else
                {
                    var objFile = aFiles[iIndex];
                }                

                $scope.Quote.Attachments.push({ AttachmentStatus: "N", Name: objFile.name, FileContent: objFile, FileType: objFile.name.split(".")[1] });
            }

            $scope.ShowBrowseLabel = $scope.ShowHideBrowseLabel();
            $scope.$apply();
            $scope.frmQuote.$dirty = true;
        };

        $scope.InitQuote();
    });
})();

