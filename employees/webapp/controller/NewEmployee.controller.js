sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
], function (Controller, MessageBox, History) {
    'use strict';
    return Controller.extend("project.employees.controller.NewEmployee", {

        onInit: function () {
            this._wizard = this.byId("newEmployeeWizard");
            this._oNavContainer = this.byId("wizardNavContainer");
            this._oWizardContentPage = this.byId("wizardContentPage");
            this.model = new sap.ui.model.json.JSONModel();

            this._clear();
            // this.model.setProperty("/FirstName", "Dilmer");
            // this.model.setProperty("/LastName", "orlando");
            // this.model.setProperty("/Dni", "12345678Z");

            this.getView().setModel(this.model);
        },

        onInternalEmployee: function () {

            var wizard = this.getView().byId("newEmployeeWizard");
            this.model.setProperty("/Type", "0");
            this._setSalario(12000, 80000);
            this.model.setProperty("/Ammount", 24000);
            wizard.setCurrentStep(this.byId("employeeDataStep"));
        },
        onSelfEmployee: function () {
            var wizard = this.getView().byId("newEmployeeWizard");
            this.model.setProperty("/Type", "1");
            this._setSalario(100, 2000);
            this.model.setProperty("/Ammount", 400);
            wizard.setCurrentStep(this.byId("employeeDataStep"));
        },
        onManagerEmployee: function () {
            var wizard = this.getView().byId("newEmployeeWizard");
            this.model.setProperty("/Type", "2");
            this._setSalario(50000, 200000);
            this.model.setProperty("/Ammount", 70000);
            wizard.setCurrentStep(this.byId("employeeDataStep"));
        },

        handleWizardCancel: function () {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            MessageBox.warning(oResourceBundle.getText("sureCancel"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        this._Cancel();
                    }
                }.bind(this)
            });
        },

        updateIncorporationDate: function (oEvent) {
            if (!oEvent.getSource().isValidValue() || !oEvent.getSource().getValue()) {
                this.model.setProperty("/IncorporationDateState", "Error");
            } else {
                this.model.setProperty("/IncorporationDateState", "None");
            };

            this._validaNext();
        },

        updateFirstName: function (oEvent) {
            if (oEvent.getSource().getValue()) {
                this.model.setProperty("/FirstNameState", "None");
            } else {
                this.model.setProperty("/FirstNameState", "Error");
            };
            this._validaNext();
        },

        updateLastName: function (oEvent) {
            if (oEvent.getSource().getValue()) {
                this.model.setProperty("/LastNameState", "None");
            } else {
                this.model.setProperty("/LastNameState", "Error");
            };
            this._validaNext();
        },

        updateDni: function (oEvent) {

            var dni = oEvent.getParameter("value");
            var number;
            var letter;
            var letterList;
            var regularExp = new RegExp(/^\d{8}[a-zA-Z]$/);


            if (oEvent.getSource().getValue()) {

                //Se comprueba que el formato es válido
                if (regularExp.test(dni) === true) {
                    //Número
                    number = dni.substr(0, dni.length - 1);
                    //Letra
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letter.toUpperCase()) {
                        this.model.setProperty("/DniState", "Error");
                    } else {
                        //Correcto
                        this.model.setProperty("/DniState", "None");
                    }
                } else {
                    //Error
                    this.model.setProperty("/DniState", "Error");
                }
            } else {
                this.model.setProperty("/DniState", "Error");
            };
            this._validaNext();
        },

        _validaNext: function () {

            if (this.model.getProperty("/FirstNameState") === 'Error' ||
                this.model.getProperty("/LastNameState") === 'Error' ||
                this.model.getProperty("/DniState") === 'Error' ||
                this.model.getProperty("/IncorporationDateState") === 'Error') {
                this._wizard.invalidateStep(this.byId("employeeDataStep"));
                this.model.setProperty("/Valid", false);
            } else {
                this.model.setProperty("/Valid", true);
                this._wizard.validateStep(this.byId("employeeDataStep"));
            }
        },

        _setSalario: function (min, max) {
            var slider = this.getView().byId("ammount");
            slider.setMax(max);
            slider.setMin(min);
        },

        wizardCompletedHandler: function () {

            //Setear los archivos en la lista de revisión.
            let files = this.byId("uploadcollection").getItems();
            let fileslList = [];
            files.forEach(item => {
                fileslList.push({ Name: item.mProperties.fileName });
            });
            this.model.setProperty("/FilesName", fileslList);
            this.model.setProperty("/FilesCount", fileslList.length);

            //Verificar errores
            if (this.model.getProperty("/FirstNameState") === 'Error' ||
                this.model.getProperty("/LastNameState") === 'Error' ||
                this.model.getProperty("/DniState") === 'Error' ||
                this.model.getProperty("/IncorporationDateState") === 'Error') {
                this.model.setProperty("/Valid", false);
            } else {
                this.model.setProperty("/Valid", true);
            }

            this._oNavContainer.to(this.byId("wizardReviewPage"));
        },

        editStepOne: function () {
            this._handleNavigationToStep(0);
        },

        editStepTwo: function () {
            this._handleNavigationToStep(1);
        },

        editStepThree: function () {
            this._handleNavigationToStep(2);
        },

        _handleNavigationToStep: function (iStepNumber) {
            var fnAfterNavigate = function () {
                this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
                this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
            this.backToWizardContent();
        },

        backToWizardContent: function () {
            this._oNavContainer.backToPage(this._oWizardContentPage.getId());
        },

        // -----  Subida de Archivos

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
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this.model.getProperty("EmployeeId") + ";" + fileName,
            });

            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

        },

        onFileUploadComplete: function (oEvent) {
            //oEvent.getSource().getBinding("items").refresh();
        },

        onFileDeleted: function (oEvent) {
            var oUploadCollection = oEvent.getSource();
            oUploadCollection.getBinding("items").refresh();
        },

        onStartUpload: function () {
            var oUploadCollection = this.byId("uploadcollection");
            var files = oUploadCollection.getItems().length;

            if (files > 0) {
                oUploadCollection.upload();
            }
        },
        ///-------------------------------------------

        //---- Gardar
        handleWizardSubmit: function (oEvent) {
            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            let val = Number.parseFloat(this.model.getProperty("/Ammount")).toFixed(2);
            let body = {
                SapId: this.getOwnerComponent().SapId,
                Type: this.model.getProperty("/Type"),
                FirstName: this.model.getProperty("/FirstName"),
                LastName: this.model.getProperty("/LastName"),
                Dni: this.model.getProperty("/Dni"),
                CreationDate: this.model.getProperty("/IncorporationDate"),
                Comments: this.model.getProperty("/Comments"),
                UserToSalary: [{
                    Ammount: val,
                    Waers: "EUR",
                    Comments: this.model.getProperty("/Comments"),
                }]
            }

            var oModel = this.getView().getModel("employeeModel");

            // Pedir confirmación
            MessageBox.confirm(oResourceBundle.getText("sureSubmit"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                         
                        //Enviar
                        oModel.create("/Users", body, {
                            success: function (data, response) {
                                this.model.setProperty("EmployeeId", data.EmployeeId);
                                this.onStartUpload();
                                let mensaje = oResourceBundle.getText("employeeCreated") + ": " + data.EmployeeId;
                                MessageBox.success( mensaje, {
                                   onClose: function () {
                                        this._Cancel();
                                   }.bind(this) 
                                } );
                            }.bind(this),
                            error: function (e) {
                                MessageBox.error(oResourceBundle.getText("savedKO"));
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
        },

        //------------------------------------


        _clear: function () {

            this.model.setProperty("/FirstNameState", "Error");
            this.model.setProperty("/LastNameState", "Error");
            this.model.setProperty("/DniState", "Error");


            this.model.setProperty("/IncorporationDate", new Date());
            this.model.setProperty("/Valid", false);
            this.model.setProperty("/EmployeeId", 0);
            this.model.setProperty("/FirstName", "");
            this.model.setProperty("/LastName", "");
            this.model.setProperty("/Dni", "");
            this.model.setProperty("/Comments", "");
            this.byId("uploadcollection").removeAllItems();

        },

        _Cancel: function () {
            this._wizard.discardProgress(this._wizard.getSteps()[0]);
            this._handleNavigationToStep(0);
            this._oNavContainer.to(this.byId("wizardContentPage"));
            this._clear();
            this.goMenu();
        },

        goMenu: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", true);
            }
        },

    });
});