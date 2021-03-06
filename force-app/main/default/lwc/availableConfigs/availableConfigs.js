import { LightningElement, track, wire, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAvailableConfig from '@salesforce/apex/CaseConfigController.getAvailableConfig';
import addCaseConfig from '@salesforce/apex/CaseConfigController.addCaseConfig';
import getCaseDetails from '@salesforce/apex/CaseConfigController.getCaseDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {
    publish, MessageContext, subscribe,
    unsubscribe,
    APPLICATION_SCOPE
} from 'lightning/messageService';

import CONFIG_REFRESH from '@salesforce/messageChannel/Saved_Config__c';

export default class AvailableConfigs extends LightningElement {

    subscription;
    @api recordId;
    @track configList = [];
    @track data = [];
    error;
    @track selectedConfig = [];
    totalRecountCount = 0;
    totalPage = 1;
    endingRecord = 0;
    pageLength = 2;
    page = 1;
    status;
    @wire(MessageContext)
    messageContext;
    addEvent = false;
  
    connectedCallback() {
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


    getConfig() {
        console.log(this.recordId);
        getAvailableConfig()
            .then(data => {
                console.log('inside refresh');
                this.totalPage = 1;
                this.page = 1;
                this.endingRecord = 0;
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


    handleSelected(event) {
        this.configList[event.target.value].isSelected = event.target.checked;
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
                this.selectedConfig = [];
                publish(this.messageContext, CONFIG_REFRESH, null);
                this.getConfig();
               // return refreshApex(this.data);
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