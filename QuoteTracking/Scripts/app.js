var Quote = angular.module("QuoteTracking", ["ngAnimate", "ngSanitize", "ui.bootstrap"]);

Quote.directive("modalDraggable", function ($document) { //  Directive for drag modal 

    return {
        restrict: "AC",
        link: function (scope, element) {

            var iStartX = 0,
                iStartY = 0,
                x = 0,
                y = 0;

            element = angular.element(document.getElementsByClassName("modal-content"));

            var objDragger = angular.element(document.getElementsByClassName("modal-header"));

            element.css({ position: 'relative' });

            objDragger.on('mousedown', function (event) {
                iStartX = event.screenX - x;
                iStartY = event.screenY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.screenY - iStartY;
                x = event.screenX - iStartX;
                element.css({
                    top: y + 'px',
                    left: x + 'px'
                });
            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }
        }
    };
}).service("Toaster", function ($rootScope) {      // Directie for toaster
    this.pop = function (type, message, title) {
        this.toast = {

            type: type,
            title: title,
            message: message
        };

        $rootScope.$broadcast('Toaster-newToast');
    };
}).directive("asToast", function (Toaster, $timeout) {  // Directive for visibility of toaster

    return {
        restrict: 'E',
        link: function (scope, ele, attrs) {
            function showToast() {
                scope.showtoast = true;
                scope.toast = Toaster.toast;

                $timeout(function () {
                    scope.showtoast = false;
                    scope.toast = {};
                }, 4000);
            }

            scope.$on('Toaster-newToast', function () {
                showToast();
            });
        },
        template: "<div class='ASToast' ng-show='showtoast' ng-class='toast.type'>" +
                        "<div class='ToastTitle'>{{toast.title}}</div>" +
                        "<div class='ToastMessage'>{{toast.message}}</div>" +
                "</div>"
    };
}).directive('ngEnter', function () {  // Directive for customize event on press Enter key

    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function () {                    
                    scope.$eval(attrs.ngEnter);
		
                });                
		
		event.preventDefault();
            }
        });
    };
}).directive('allowTyping', function () {  // Directive for strict customized typing format on respective inputs
   
    return {
        restrict: 'A',
        link: function (scope, element, attrs, ctrl) {
            var regex = attrs.allowTyping;
            element.bind('keypress', function (event) {
                var pos = event.target.selectionStart;
                var oldViewValue = element.val();
                var input = newViewValue(oldViewValue, pos, event.key);
 
                var validator = new RegExp(regex);
                if (!validator.test(input)) {
                    event.preventDefault();
                    return false;
                }
            });
            function newViewValue(oldViewValue, pos, key) {
                if (!oldViewValue) return key;
                return [oldViewValue.slice(0, pos), key, oldViewValue.slice(pos)].join('');
            }
        }
    };
}).directive('dropzone', function (Common) {  // Directive for drag/drop attachment files on attachment input

    return {
        restrict: 'A',
        scope: {
            fileData: '='
        },
        link: function (scope, element, attrs) {
            var checkSize,
                isTypeValid,
                processDragOverOrEnter,
                validMimeTypes;

            processDragOverOrEnter = function (event) {

                if (event.type == "dragover")
                    document.getElementById("dvFileDragDropOverlay").style.display = "block";

                if (scope.$parent.objRightsView.EmsAdd == false) {
                    if (event != null) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
                else {
                    if (event != null) {
                        event.preventDefault();
                    }
                    event.dataTransfer.effectAllowed = 'copy';
                    return false;
                }

            };

            validMimeTypes = attrs.fileDropzone;

            checkSize = function (size) {
                var _ref;
                if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
                    return true;
                } else {
                    alert("File must be smaller than " + attrs.maxFileSize + " MB");
                    return false;
                }
            };

            isTypeValid = function (type) {
                if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
                    return true;
                } else {
                    alert("Invalid file type.  File must be one of following types " + validMimeTypes);
                    return false;
                }
            };

            element.bind('dragover', processDragOverOrEnter);
            element.bind('dragenter', processDragOverOrEnter);
            element.bind('dragleave', function () {
                document.getElementById("dvFileDragDropOverlay").style.display = "none";
            });

            return element.bind('drop', function (event) {
                document.getElementById("dvFileDragDropOverlay").style.display = "none";

                //var file, name, reader, size, type;
                if (scope.$parent.objRightsView.EmsAdd == false) {
                    if (event != null) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
                else {
                    if (event != null) {
                        event.preventDefault();
                    }

                    var aFileDtl = [];

                    function readmultifiles(files) {
                        var reader = new FileReader();
                        function readFile(index) {
                            if (index >= files.length) {
                                scope.$apply(function () {
                                    return scope.fileData = aFileDtl;
                                });

                                return;
                            }

                            var file = files[index];
                            reader.onload = function (e) {
                                aFileDtl.push({ file: e.target.result, filename: file.name });
                                readFile(index + 1);
                            }

                            reader.readAsDataURL(file);
                        }
                        readFile(0);
                    }

                    readmultifiles(event.dataTransfer.files);

                    return false;
                }

            });
        }
    };
}).directive('onErrorSrc', function() {  // Directive for set alternaticve icon on attachment icon error

    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    }
}).controller("QuoteTrackingController", function ($scope, $uibModal, $http, $timeout, Common, Toaster) {

    $scope.SearchValue = "";
    $scope.QuoteNumber = -1;     
    $scope.DeleteIndex = -1;
    $scope.Mode = "";
    $scope.FromEstDatePopup = false;
    $scope.ToEstDatePopup = false;

    /**************************************************
        Name: OpenDate
        Descrpition: To set open date picker popup 
    **************************************************/
    $scope.OpenDate = function (sDatePicker) {
        if (sDatePicker === 'FROMEST') {
            $scope.FromEstDatePopup = true;
        }
        else if (sDatePicker === 'TOEST') {
            $scope.ToEstDatePopup = true;
        }
    };

    /*********************************************************************
        Name: LoadMaster
        Description: To Load master table data 
    *********************************************************************/
    $scope.LoadMaster = function () {
        $scope.Loading = true;
        $http.get("api/QuoteMaster").then(function (objResponse) {
           
            var objAllDept = {};

            objAllDept["DepartmentRecordId"] = -1;
            objAllDept["DepartmentName"] = 'All';

            var objAllInvoice = {};

            objAllInvoice["InvoiceStatusCode"] = 'ALL';
            objAllInvoice["InvoiceStatusName"] = 'All';
            
            var objAllPO = {};

            objAllPO["POStatusCode"] = 'ALL';
            objAllPO["POStatusName"] = 'All';
            objResponse.data.MasterDepartments.unshift(objAllDept);
            objResponse.data.MasterInvoiceStatus.unshift(objAllInvoice);
            objResponse.data.MasterPOStatus.unshift(objAllPO);
            $scope.DepartmentOptions = objResponse.data.MasterDepartments;
            $scope.InvoiceStatusOptions = objResponse.data.MasterInvoiceStatus;
            $scope.POStatusOptions = objResponse.data.MasterPOStatus;
            $scope.DepartmentRecordId = -1
            $scope.QuoteOptions = "All"
            $scope.QuoteStatusOptions = "All";
            $scope.InvoiceStatusCode = 'ALL';
            $scope.POStatusCode = 'ALL';
            $scope.GetQuotes();
            $scope.Loading = false;
        });        
    };

    /********************************************************************
        Name: InitGrid
        Description: To initiate grid fucntions
    *********************************************************************/
    $scope.InitGrid = function () {
       
        // To set grid column header values and row data
        var aGridQuoteColumns = [
            { headerName: "Quote #", field: "QuoteNumber", headerClass: "scGridHeader", cellClass: "text-center scGridColumn", width: 80, cellRenderer: Common.TextCellRenderer },
            {
                headerName: "Quote Status", field: "QuoteStatus", headerClass: "scGridHeader", cellClass: "scGridColumn", width: 120,
                getQuickFilterText: function (objParam) {
                    return objParam.value != null ? objParam.value.toString().replace(/ /g,'') : "";
                },
                cellRenderer: Common.TextCellRenderer
            },
            {
                headerName: "Department", field: "Department", headerClass: "scGridHeader", cellClass: "text-left scGridColumn", width: 150, 
                getQuickFilterText: function (objParam) {
                    return objParam.value != null ? objParam.value.toString().replace(/ /g, '') : "";
                },
                cellRenderer: Common.TextCellRenderer
            },
            {
                headerName: "Description", field: "Description", headerClass: "scGridHeader", cellClass: "text-left scGridColumn", width: 250, tooltipField: "Description",
                getQuickFilterText: function (objParam) {
                    return objParam.value != null ? objParam.value.toString().replace(/ /g, '') : "";
                },
                cellRenderer: Common.TextCellRenderer
            },
            {
                headerName: "Used By", field: "UserName", headerClass: "scGridHeader", cellClass: "text-left scGridColumn", width: 150,
                getQuickFilterText: function (objParam) {
                    return objParam.value != null ? objParam.value.toString().replace(/ /g, '') : "";
                },
                cellRenderer: Common.TextCellRenderer
            },
            {
                headerName: "Estimated", children: [
                   {
                       headerName: "Hours", field: "EstimatedHours", headerClass: "scGridHeader", cellClass: "text-right scGridColumn", width: 80,
                       getQuickFilterText: function (objParam) {
                           return  objParam.value != null ? objParam.value.toString() : "";
                       },
                       cellRenderer: Common.TextCellRenderer
                   },
                   {
                       headerName: "Date", field: "EstimatedDate", headerClass: "scGridHeader", cellClass: "text-center scGridColumn", width: 100,
                       getQuickFilterText: function (objParam) {
                           return $scope.FormatDate(objParam.value);
                       },
                       cellRenderer: Common.DateCellRenderer
                   }
                ]
            },
            {
                headerName: "Requisition", children: [
                   {
                       headerName: "#", field: "RequisitionNumber", headerClass: "scGridHeader", cellClass: "text-right scGridColumn", width: 140,
                       getQuickFilterText: function (objParam) {
                           return objParam.value != null ? objParam.value.toString() : "";
                       },
                       cellRenderer: Common.TextCellRenderer
                   },
                   {
                       headerName: "Date", field: "RequisitionDate", headerClass: "scGridHeader", cellClass: "text-center scGridColumn", width: 100,
                       getQuickFilterText: function (objParam) {
                           return $scope.FormatDate(objParam.value);
                       },
                       cellRenderer: Common.DateCellRenderer
                   }
                ]
            },
            {
                headerName: "Purchase Order", children: [
                   {
                       headerName: "#", field: "PONumber", headerClass: "scGridHeader", cellClass: "text-right scGridColumn", width: 140,
                       getQuickFilterText: function (objParam) {
                           return objParam.value != null ? objParam.value.toString() : "";
                       },
                       cellRenderer: Common.TextCellRenderer
                   },
                   {
                       headerName: "Date", field: "PODate", headerClass: "scGridHeader", cellClass: "text-center scGridColumn", width: 100,
                       getQuickFilterText: function (objParam) {
                           return $scope.FormatDate(objParam.value);
                       },
                       cellRenderer: Common.DateCellRenderer
                   },
                   { headerName: "Status", field: "POStatus", headerClass: "scGridHeader", cellClass: "text-left scGridColumn", width: 120, cellRenderer: Common.TextCellRenderer }
                ]
            },
            {
                headerName: "Invoice", children: [
                   {
                       headerName: "#", field: "InvoiceNumber", headerClass: "scGridHeader", cellClass: "text-right scGridColumn", width: 140,
                       getQuickFilterText: function (objParam) {
                           return objParam.value != null ? objParam.value.toString() : "";
                       },
                       cellRenderer: Common.TextCellRenderer
                   },
                   {
                       headerName: "Date", field: "InvoiceDate", headerClass: "scGridHeader", cellClass: "text-center scGridColumn", width: 120,
                       getQuickFilterText: function (objParam) {
                           return $scope.FormatDate(objParam.value);
                       },
                       cellRenderer: Common.DateCellRenderer
                   },
                   { headerName: "Status", field: "InvoiceStatus", headerClass: "scGridHeader", cellClass: "text-left scGridColumn", width: 120, cellRenderer: Common.TextCellRenderer }
                ]
            },
            {
                headerName: "Re-Quote", field: "IsReQuote", headerClass: "scGridHeader", cellClass: "text-center scGridColumn", width: 90,
                cellRenderer: function (objParam) {
                    return $scope.YesNo(objParam.data.IsReQuote);
                }
            },
            {
                headerName: "Deleted", field: "IsDelete", headerClass: "scGridHeader", cellClass: "text-center scGridColumn", width: 80,
                cellRenderer: function (objParam) {
                    return $scope.YesNo(objParam.data.IsDelete);                   
                }
            },
        ];                
        
        /********************************************************************
            Name: QuoteGridOption
            Description: To customize grid options
        *********************************************************************/
        $scope.QuoteGridOption = {            
            columnDefs: aGridQuoteColumns,
            rowData: [],
            rowSelection: "single",            
            keyField: "QuoteNumber",            
            onGridReady: function (objParam) {},
            onRowDataChanged: function (objParam) {

                // To set selelcted row
                if ($scope.Mode == "DELETE" && $scope.DeleteIndex != -1)
                {

                    var iRowCount = objParam.api.getDisplayediRowCount();

                    if ($scope.DeleteIndex >= iRowCount)
                    {
                        $scope.DeleteIndex = 0;
                    }

                    var objSelectNode = objParam.api.getDisplayedRowAtIndex($scope.DeleteIndex);

                    objSelectNode.setSelected(true);
                    $scope.QuoteNumber = objSelectNode.data.QuoteNumber;
                    $scope.DeleteIndex = -1;
                }

                if ($scope.QuoteNumber != -1)
                {
                    objParam.api.forEachNode(function (objNode, iIndex) {
                        if (objNode.data.QuoteNumber == $scope.QuoteNumber) {
                            objNode.setSelected(true);
                            objParam.api.ensureIndexVisible(iIndex);
                        }                        
                    });
                }

                else {
                    var objNode = objParam.api.getDisplayedRowAtIndex(0);

                    if(objNode != null)
                    {
                        objNode.setSelected(true);
                        $scope.QuoteNumber = objNode.data.QuoteNumber;
                    }                    
                }

                var objFirstNode = objParam.api.getDisplayedRowAtIndex(0);

                if (objFirstNode != null && objParam.api.getSelectedRows().length == 0)
                {
                    objFirstNode.setSelected(true);
                }

            },

            onRowDoubleClicked: function (objParam) {                               
                $scope.OpenQuote("EDIT");                
            },            
            overlayNoRowsTemplate: '<span></span>',           
        };       

        new agGrid.Grid(dgdQuote, $scope.QuoteGridOption);
        $scope.LoadMaster();        
    };   
             
    /************************************************************
        Name: OnSearch
        Description: To search for the given text in grid data
    ************************************************************/
    $scope.onSearch = function () {

        Common.SearchText = $scope.SearchValue;
        $scope.QuoteGridOption.api.setQuickFilter($scope.SearchValue.replace(/ /g, ''));
        $scope.QuoteGridOption.api.redrawRows();
    };

    /***********************************************************
        Name: GetQuotes
        Description: To get quote data grid from database
    ***********************************************************/
    $scope.GetQuotes = function (sMode) {

        var sMode = $scope.Mode;
        var sFilterQuery = "";
        var dtFromDateEst = angular.copy($scope.FromEstDate);
        var dtToDateEst = angular.copy($scope.ToEstDate);        

        dtFromDateEst = Common.FormatDate($scope.FromEstDate, "yyyy-mm-dd");
        dtToDateEst = Common.FormatDate($scope.ToEstDate, "yyyy-mm-dd");        
               
        if ($scope.QuoteOptions != "All")
        {
            // To filter by 'Department'
            if ($scope.QuoteOptions == "OnSelectDepartment")
            {
                if ($scope.DepartmentRecordId != -1) {
                    sFilterQuery = "ASQ.DepartmentRecordId=" + $scope.DepartmentRecordId;
                }
            }

            // To filter by 'Qoute Number'
            else if ($scope.QuoteOptions == "OnSelectQuoteNumber")
            {
                if ($scope.FilterQuoteNumber != "" & $scope.FilterQuoteNumber != null)
                {
                    sFilterQuery = sFilterQuery +" QuoteNumber=" + $scope.FilterQuoteNumber;
                }
            }

            // To filter by 'Invoice Status'
            else if ($scope.QuoteOptions == "OnSelectInvoiceStatus")
            {
                if ($scope.InvoiceStatusCode != "ALL")
                {
                    sFilterQuery = "ASI.StatusCode= '" + $scope.InvoiceStatusCode+"'";
                }
            }

            // To filter by 'PO Status'
            else if ($scope.QuoteOptions == "OnSelectPOStatus")
            {
                if ($scope.POStatusCode != "ALL")
                {
                    sFilterQuery = "ASPO.StatusCode= '" + $scope.POStatusCode + "'";
                }
            }

            // To filter by 'Quote Status'
            else if ($scope.QuoteOptions == "OnSelectQuoteStatus")
            {
                if ($scope.QuoteStatusOptions != "All")
                {
                    if ($scope.QuoteStatusOptions == "APD")
                    {
                        sFilterQuery = sFilterQuery + " QuoteStatusCode=" + "'APD'";
                    }

                    else if ($scope.QuoteStatusOptions == "OHD")
                    {
                        sFilterQuery = sFilterQuery + " QuoteStatusCode=" + "'OHD'";
                    }

                    else if ($scope.QuoteStatusOptions == "UAPD")
                    {
                        sFilterQuery = sFilterQuery + "(QuoteStatusCode=" + "'NEW'" + " OR QuoteStatusCode=" + "'RVD')";
                    }
                }
            }

            // To filter by 'Estimate Date'
            else if ($scope.QuoteOptions == "OnSelectEstDate")
            {
                if (dtFromDateEst != "" || dtToDateEst != "")
                {
                    if (dtFromDateEst == "")
                    {
                        Toaster.pop("ERROR", Common.DATEFILTERCHECKMSG);
                        return false;
                    }

                    else if (dtToDateEst == "")
                    {
                        Toaster.pop("ERROR", Common.DATEFILTERCHECKMSG);
                        return false;
                    }

                    else if (dtFromDateEst > dtToDateEst)
                    {
                        Toaster.pop("ERROR", Common.DATEFILTERMSG);
                        return false;
                    }

                    else
                    {
                        sFilterQuery = sFilterQuery + " EstimatedDate" + ">= '" + dtFromDateEst + "' AND EstimatedDate" + "<= '" + dtToDateEst + "'";
                    }
                }
            }
        }

        sFilterQuery = sFilterQuery == "" ? "1=1" : sFilterQuery;

        // To set 'Isdelete' column true if teh data is deleted
        if ($scope.ShowDelete == true)
        {
            sFilterQuery = sFilterQuery;            
        }

        else
        {
            sFilterQuery = sFilterQuery + " AND IsDelete IS NULL";            
        }

        $scope.NoDataTemplate = false;
        $scope.Loading = true;

        $http.defaults.headers.common['FilterQuery'] = sFilterQuery;

        var sUrl = "api/Quote";

        $http.get(sUrl).then(function (objResponse) {

            if (objResponse != null && objResponse.hasOwnProperty("data") && objResponse.data != null)
            {
                $scope.QuoteGridOption.api.setRowData(objResponse.data);

                if (objResponse.data.length == 0)
                {
                    $scope.NoDataTemplate = true;
                }
            }

            $scope.Loading = false;            
        },
        function (objErrorResponse) {

            if (objErrorResponse.data.hasOwnProperty("ExceptionMessage") == true)
            {
                Common.AlertPopUp(objErrorResponse.data.ExceptionMessage);
            }

            else
            {
                Common.AlertPopUp(objErrorResponse.data.Message);
            }

            $scope.Loading = false;
        });
    };    

    /****************************************
        Name: TodayDate
        Description: To set today date 
    ****************************************/
    $scope.TodayDate = function () {
        var dtToday = new Date();
        var iDay = dtToday.getDate();
        var iMonth = dtToday.getMonth() + 1; //As January is 0.
        var iYear = dtToday.getFullYear();

        if (iDay < 10) iDay = '0' + iDay;
        if (iMonth < 10) iMonth = '0' + iMonth;

        return new Date();
    };

    /*************************************************************************
        Name: FormatDate
        Description: To format date object from ui datepicker into date
    *************************************************************************/
    $scope.FormatDate = function (objDate) {

        if (objDate != null)
        {
            var dtToday = new Date(objDate);
            var iDay = dtToday.getDate();
            var iMonth = dtToday.getMonth() + 1; //As January is 0.
            var iYear = dtToday.getFullYear();

            if (iDay < 10) iDay = '0' + iDay;
            if (iMonth < 10) iMonth = '0' + iMonth;

            return (iDay + "/" + iMonth + "/" + iYear);
        }

        return "";
    };   

    /***********************************************************************
        Name: YesNo
        Description: To set 'Yes' for columns 'IsRequote' and 'IsDelete'
    ***********************************************************************/
    $scope.YesNo = function (sData) {

        if (sData != null && sData == true)
        {
            return "Yes";
        }

        return "";
    };

    /******************************************
        Name: DeleteQoute
        Description: To delete a quote
    ******************************************/
    $scope.DeleteQuote = function () {        

        var iQuoteNumber = $scope.QuoteNumber;      
        var sUrl = "api/Quote?quoteNumber=" + iQuoteNumber;

        $scope.Loading = true;

        $http.delete(sUrl, JSON.stringify({QuoteNumber: iQuoteNumber})).then(
            function (objResponse) {

                var sMsg = (Common.DELETEMSG).replace('{0}', iQuoteNumber);

                Toaster.pop("SUCCESS", sMsg);
                $scope.IsDelete = true;

                $scope.QuoteGridOption.api.forEachNode(function (objNode, iIndex) {

                    if (objNode.data.QuoteNumber == $scope.QuoteNumber)
                    {
                        $scope.DeleteIndex = iIndex;
                    }

                });

                $scope.GetQuotes();
                $scope.Loading = false;
            },
            function (objErrorResponse) {
                Common.AlertPopUp(objErrorResponse.data);
                $scope.Loading = false;
            });        
    };

    /*********************************************************************
        Name: ConfirmDelete
        Description: To show confirm poopup on click delete for a data
    *********************************************************************/
    $scope.ConfirmDelete = function (sMode) {

        var objNode = $scope.QuoteGridOption.api.getSelectedNodes().length > 0 ? $scope.QuoteGridOption.api.getSelectedNodes()[0] : null;

        if (objNode != null)
        {
            $scope.QuoteNumber = objNode.data.QuoteNumber;
            $scope.Mode = sMode;
            Common.ConfirmPopUp(Common.DELETECONFIRMRMSG + $scope.QuoteNumber, $scope.DeleteQuote);
        }

        else
        {
            Common.AlertPopUp(Common.SELECTDELETEMSG);
        }        
    };

    /****************************************************************
        Name: OpenQuote
        Description: To open quote modal for Add/Update quote
    *****************************************************************/
    $scope.OpenQuote = function (sMode) {        
        $scope.Mode = sMode;

        if (sMode == "ADD")
        {
            $scope.QuoteNumber = -1;
        }
        else {
            var objNode = $scope.QuoteGridOption.api.getSelectedNodes().length > 0 ? $scope.QuoteGridOption.api.getSelectedNodes()[0] : null;
            
            if (objNode != null) {
                $scope.QuoteNumber = objNode.data.QuoteNumber;

                // To set prevent opening 'Re-Quote' modal if data quote status is 'Approved' or 'On Hold'
                if (sMode == "REQUOTE") {
                    if (objNode.data.QuoteStatusCode == "APD" || objNode.data.QuoteStatusCode == "OHD") {
                        Common.AlertPopUp(Common.REQUOTEDENYMSG);

                        return false;
                    }
                }

            }
            else {
                Common.AlertPopUp(Common.SELECTQUOTEMSG); // If the user add/update quote without selecting a qoute

                return false;
            }
       }

        // Ui modal open
        var objModalInstance = $uibModal.open({
            templateUrl: "Views/AddEditQuote.html",
            controller: "AddEditQuoteController",
            backdrop: "static",
            windowClass: "OpenModelCenter",
            resolve: {
                QuoteParam: function () {
                    return { "QuoteNumber": $scope.QuoteNumber, "Mode": sMode };
                }
            }
        }).result.catch(function (iQuoteNumber) {

            if (!isNaN(iQuoteNumber))
            {
                var sMsg = (
                    $scope.Mode.toUpperCase() === "ADD"
                    ? Common.SUCCESSMSG
                    : $scope.Mode.toUpperCase() === "EDIT"
                        ? Common.UPDATEMSG
                        : $scope.Mode.toUpperCase() === "REQUOTE"
                            ? Common.REQUOTEMSG
                            : ""
                            ).replace('{0}', iQuoteNumber);
                $scope.QuoteNumber = iQuoteNumber;
                $scope.GetQuotes();
                Toaster.pop("SUCCESS", sMsg);
            }
        });
    };

    $scope.InitGrid();    
});