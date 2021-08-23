/* eslint-disable no-undef */
//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, Filter, FilterOperator, MessageBox, Fragment) {

    return Controller.extend("project.employees.controller.EmployeeDetails", {
        onInit: function () {

            var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                isSelectedOne: false,
            });

            this.getView().setModel(oJSONModelConfig, "jsonModelConfig");

            this._bus = sap.ui.getCore().getEventBus();
            this._bus.subscribe("flexible", "showEmployee", this.showEmployeDetails, this);
        },


        //#region Adminsitración de datos de empleados
        showEmployeDetails: function (catagory, nameEvent, path) {
            var detailView = this.getView();
            detailView.bindElement({
                path: "employeeModel>" + path,
                // Los eventos no estan haciendo nada , pero lo dejo para saber que los puedo usar cuando hago un binding
                events: {
                    change: function (oEvent) {

                    },
                    dataRequested: function () {

                    },
                    dataReceived: function (oData) {

                    }
                }
            });

            var oJSONModelConfig = detailView.getModel("jsonModelConfig");
            oJSONModelConfig.setProperty("/isSelectedOne", true);

            var oBndContext = detailView.getBindingContext("employeeModel").getObject();
            this.showFiles(oBndContext.EmployeeId);

        },


        clearNewSalary: function () {
            var oJSONModelNeySalary = new sap.ui.model.json.JSONModel({
                Ammount: 0,
                AmmountState: "Error",
                Comments: '',
                CreationDate: new Date(),
                CreationDateState: "None",
                Valid: false
            });
            this.getView().setModel(oJSONModelNeySalary, "jsonModelNewSalary");
        },

        onDeleteEmployee: function (oEvent) {

            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var oBndContext = this.getView().getBindingContext("employeeModel").getObject();

            MessageBox.confirm(oResourceBundle.getText("sureDeleteUser"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {

                        //Enviar
                        this.getView().getModel("employeeModel").remove("/Users(SapId='" + oBndContext.SapId +
                            "',EmployeeId='" + oBndContext.EmployeeId + "')", {
                            success: function (data, response) {

                                let mensaje = oResourceBundle.getText("userDeletedOK");
                                MessageBox.success(mensaje, {
                                    onClose: function () {
                                        var oJSONModelConfig = this.getView().getModel("jsonModelConfig");
                                        oJSONModelConfig.setProperty("/isSelectedOne", false);
                                        this._bus.publish("flexible", "onDeletedUser", oBndContext.EmployeeId);
                                    }.bind(this)
                                });
                            }.bind(this),

                            error: function (e) {
                                MessageBox.error(oResourceBundle.getText("userDeletedKO"));
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
        },

        onPromotion: function (oEvent) {
            const oView = this.getView();
            this.clearNewSalary();

            if (!this.byId("dialogAddSalary")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "project.employees.fragment.DialogAddSalary",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this.byId("dialogAddSalary").open();
            }
        },

        onCancelnNewSalary: function () {
            this.byId("dialogAddSalary").close();
        },

        onSaveNewSalary: function () {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var oBndContext = this.getView().getBindingContext("employeeModel").getObject();
            var oModelSalary = this.getView().getModel("jsonModelNewSalary");
            //var path = oBndContext.getPath();

            let val = Number.parseFloat(oModelSalary.getProperty("/Ammount")).toFixed(2);
            var body = {
                SapId: oBndContext.SapId,
                EmployeeId: oBndContext.EmployeeId,
                CreationDate: oModelSalary.getProperty("/CreationDate"),
                Ammount: val,
                Comments: oModelSalary.getProperty("/Comments"),
                Waers: "EUR"
            }

            var oModel = this.getView().getModel("employeeModel");
            MessageBox.confirm(oResourceBundle.getText("sureSaveSalary"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {

                        //Enviar
                        oModel.create("/Salaries", body, {
                            success: function (data, response) {
                                let mensaje = oResourceBundle.getText("salarySavedOK");
                                
                                MessageBox.success(mensaje, {
                                    onClose: function () {
                                        oModel.refresh();
                                        this.byId("dialogAddSalary").close();
                                    }.bind(this)
                                });
                            }.bind(this),

                            error: function (e) {
                                MessageBox.error(oResourceBundle.getText("salarySavedOK"));
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
        },

        updateCreationDate: function (oEvent) {
            var oModel = this.getView().getModel("jsonModelNewSalary");
            if (!oEvent.getSource().isValidValue() || !oEvent.getSource().getValue()) {
                oModel.setProperty("/CreationDateState", "Error");
            } else {
                oModel.setProperty("/CreationDateState", "None");
            };

            this._isValidSalary();

        },

        updateAmmount: function (oEvent) {

            var value = oEvent.getSource().getValue()
            var oModel = this.getView().getModel("jsonModelNewSalary");
            if (value <= 0) {
                oModel.setProperty("/AmmountState", "Error")
            } else {
                oModel.setProperty("/AmmountState", "None")
            }
            this._isValidSalary();
        },

        _isValidSalary() {

            var oModel = this.getView().getModel("jsonModelNewSalary");
            if (oModel.getProperty("/CreationDateState") === "Error" ||
                oModel.getProperty("/AmmountState") === "Error"
            ) {
                oModel.setProperty("/Valid", false);
            }
            else {
                oModel.setProperty("/Valid", true);
            }

        },





        //#endregion


        //#region Adminsitración de archivos

        showFiles: function (employeeId) {
            var detailView = this.getView();
            detailView.byId("uploadcollection").bindAggregation("items", {
                path: "employeeModel>/Attachments",
                filters: [
                    new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
                    new Filter("EmployeeId", FilterOperator.EQ, employeeId)
                ],
                template: new sap.m.UploadCollectionItem({
                    documentId: "{employeeModel>AttId}",
                    visibleEdit: false,
                    fileName: "{employeeModel>DocName}"
                }).attachPress(this.downloadFile)
            });
        },



        onFileChange: function (oEvent) {

            let oUploadCollection = oEvent.getSource();

            //Header Token
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("employeeModel").getSecurityToken()
            });
            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        },

        onFileBeforeUpload: function (oEvent) {
            let fileName = oEvent.getParameter("fileName");
            let objectContext = oEvent.getSource().getBindingContext("employeeModel").getObject();
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + objectContext.EmployeeId + ";" + fileName,
            });

            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

        },

        onFileUploadComplete: function (oEvent) {
            oEvent.getSource().getBinding("items").refresh();
        },

        onFileDeleted: function (oEvent) {
            var oUploadCollection = oEvent.getSource();
            var sPath = oEvent.getParameter("item").getBindingContext("employeeModel").getPath();
            this.getView().getModel("employeeModel").remove(sPath, {
                success: function () {
                    oUploadCollection.getBinding("items").refresh();
                },
                error: function () {

                }
            });
        },

        downloadFile: function (oEvent) {
            const sPath = oEvent.getSource().getBindingContext("employeeModel").getPath();
            window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV/" + sPath + "/$value")
        },
        //#endregion 


    });



});