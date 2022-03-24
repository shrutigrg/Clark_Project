import { LightningElement, track, wire, api } from 'lwc';
import getCaseConfig from '@salesforce/apex/CaseConfigController.getCaseConfig';
import sendCase from '@salesforce/apex/CaseConfigCalloutService.sendCase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CONFIG_SAVED from '@salesforce/messageChannel/Saved_Config__c';
import getCaseDetails from '@salesforce/apex/CaseConfigController.getCaseDetails';
import {
    publish,
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext,
} from 'lightning/messageService';



export default class CaseConfigs extends LightningElement {

    @api recordId;
    subscription;
    @track configList = [];
    @track result = [];
    error;
    @track selectedConfig = [];
    disabled = false;
    cssClass = 'slds-button slds-button_neutral';
    @wire(MessageContext)
    messageContext;
    status;
    empty;



    subscribeToMessageChannel() {

        this.subscription = subscribe(
            this.messageContext,
            CONFIG_SAVED,
            (message) => this.refreshCaseConfigs(true)

        );
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
        this.refreshCaseConfigs(false);

    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }


    /* Server call to get the Case Config records for the Case id*/
    refreshCaseConfigs(addEvent) {
        getCaseConfig({ recordId: this.recordId })
            .then(result => {      
                
                                    //promise function if no error
                this.configList = JSON.parse(result);        
                if(this.configList == ''){
                    this.empty = true;
                }   
                else{ 
                    this.empty = false;
                }                     
                if (addEvent) {
                    this.refreshCaseConfigs(false);
                }
            })
            .catch(error => {
                this.error = error;
                console.log('error  config---' + error);
                this.showToast('Error', error, 'error');
            });
    }



    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    /* Server call to send the Case Config records to external system for the Case id*/
    sendCaseConfigs(event) {
        //this.disabled = true;
        //get the case status to check if case status is closed or not
        getCaseDetails({ caseId: this.recordId })
            .then(result => {
                //check if case is not closed 
                if (result != 'Closed') {
                    sendCase({ recordId: this.recordId })
                        .then(result => {

                            this.status = result;
                            this.showToast('', 'Case is successfully closed!', 'Success');

                        })
                        .catch(error => {
                            this.error = error;
                            console.log('errror inside ---' + error);
                            this.showToast('Error', error, 'error');
                        });

                }
                else {
                    this.showToast('', 'Cannot send request to closed case!', 'Info');
                    console.log('result----' + result);
                }


            })
            .catch(error => {
                this.error = error;
                console.log('errror outside ---' + error);
                this.showToast('Error', error, 'error');
            });
    }
}