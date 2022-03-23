import { LightningElement, track, wire, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAvailableConfig from '@salesforce/apex/CaseConfigController.getAvailableConfig';
import addCaseConfig from '@salesforce/apex/CaseConfigController.addCaseConfig';
import getCaseDetails from '@salesforce/apex/CaseConfigController.getCaseDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import STATUS_FIELD from '@salesforce/schema/Case.Status';
import CASE_OBJECT from '@salesforce/schema/Case';
import {
    publish, MessageContext, subscribe,
    unsubscribe,
    APPLICATION_SCOPE
} from 'lightning/messageService';

import CONFIG_SAVED from '@salesforce/messageChannel/Saved_Config__c';
const fields = [STATUS_FIELD];

export default class AvailableConfigs extends LightningElement {

    subscription;
    @api recordId;
    @track configList = [];
    @track data = [];
    @track error;
    @track selectedConfig = [];
    @track totalRecountCount = 0;
    @track totalPage = 1;
    @track endingRecord = 0;
    @track pageLength = 2;
    @track page = 1;
    status;
    @wire(MessageContext)
    messageContext;
    addEvent = false;



    subscribeToMessageChannel() {

        this.subscription = subscribe(
            this.messageContext,
            CONFIG_SAVED,
            (message) => this.getConfig()

        );

    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
        this.getConfig(); //load the data
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }

    /* @wire(getRecord, { recordId: '$recordId', fields })
     case;*/




    getConfig() {
        console.log(this.recordId);
        getAvailableConfig()
            .then(data => {
                this.configList = JSON.parse(data);
                this.totalRecountCount = this.configList.length;
                this.totalPage = Math.ceil(this.totalRecountCount / this.pageLength);
                this.data = this.configList.slice(0, this.pageLength);
                this.endingRecord = this.pageLength;

            })
            .catch(error => {
                this.error = error;
                console.log('no case closed');
                this.showToast('Error', error, 'error');
            });
    }

    refresh() {
        console.log('inside refresh' + this.caseStatus.data);
        //return refreshApex(this.caseStatus); 
    }

    handleSelected(event) {
        this.configList[event.target.value].isSelected = event.target.checked;
    }
    allSelected(event) {
        for (var i = 0; i < this.configList.length; i++) {
            this.configList[i].isSelected = event.target.checked;
        }
    }
    addSelected(event) {

        getCaseDetails({ caseId: this.recordId })
            .then(result => {
                if (result != 'Closed') {
                    for (var i = 0; i < this.configList.length; i++) {
                        if (this.configList[i].isSelected) {
                            this.selectedConfig.push(this.configList[i]);
                            this.configList[i].isSelected = false;
                        }
                    }

                    if (this.selectedConfig.length != 0) {
                        this.handleSelectedConfigs(this.selectedConfig);
                    }
                    else {
                        this.showToast('Info', 'Please select atleast one record to add!', 'info');
                    }

                }
                else {
                    this.showToast('Case Closed', 'Case Configs cannot be added after Case is closed', 'info');
                }
            })
    }

    handleSelectedConfigs(selectedConfig) {

        addCaseConfig({
            selectedConfig: JSON.stringify(selectedConfig),
            caseId: this.recordId
        })
            .then(result => {
                this.addEvent = true;
                publish(this.messageContext, CONFIG_SAVED, null);
                return refreshApex(this.getConfig());
            })
            .catch(error => {
                this.error = error;
                console.log('error--' + error);
                this.showToast('Error', error, 'error');
            });
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





}