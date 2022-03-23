import { LightningElement, track, wire, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getCaseConfig from '@salesforce/apex/CaseConfigController.getCaseConfig';
import sendCase from '@salesforce/apex/CaseConfigCalloutService.sendCase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
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
    @track data = [];
    error;
    @track selectedConfig = [];
    totalRecountCount = 0;
    totalPage = 1;
    endingRecord = 0;
    pageLength = 2;
    page = 1;
    disabled = false;
    toggleVariant = 'brand';
    cssClass = 'slds-button slds-button_neutral';
    @wire(MessageContext)
    messageContext;
    status;



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

    async refreshCase() {
        await getCaseDetails({ caseId: '$recordId' })
            .then(result => {
                this.status = result;
            })
    }

    refreshCaseConfigs(addEvent) {
        getCaseConfig({ recordId: this.recordId })
            .then(result => {

                this.configList = JSON.parse(result);
                this.totalRecountCount = this.configList.length;
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageLength);
                this.data = this.configList.slice(0, this.pageLength);
                this.endingRecord = this.pageLength;
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

    nextpage() {
        if ((this.page < this.totalPage)) {      // && this.page != this.totalPage
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    prevpage() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    displayRecordPerPage(page) {

        this.startingRecord = ((page - 1) * this.pageLength);
        this.endingRecord = (this.pageLength * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount)
            ? this.totalRecountCount : this.endingRecord;

        this.data = this.configList.slice(this.startingRecord, this.endingRecord);

        //increment by 1 to display the startingRecord count, 
        //so for 2nd page, it will show "Displaying 6 to 10 of 23 records. Page 2 of 5"
        this.startingRecord = this.startingRecord + 1;
    }

    sendCaseConfigs(event) {
        this.disabled = true;
        sendCase({ recordId: this.recordId })
            .then(result => {
                getCaseDetails({ caseId: this.recordId })
                    .then(result => {
                        if (result == 'Closed') {
                            this.status = result;
                            this.showToast('Case Status', 'Case is closed!', 'Success');
                            this.cssClass = 'slds-button slds-button_outline-brand';
                            // getRecordNotifyChange([{recordId: this.recordId}])
                            publish(this.messageContext, CONFIG_SAVED, null);

                        }
                    })
            })
            .catch(error => {
                this.error = error;
                this.showToast('Error', error, 'error');
            });
    }
}