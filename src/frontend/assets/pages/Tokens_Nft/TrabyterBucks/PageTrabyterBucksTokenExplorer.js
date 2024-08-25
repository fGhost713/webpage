import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, init, GetTransactionsRequest } from "../../../global_scripts/types/TokenInterface.js";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { TokenExplorer } from "../Common/TokenExplorer.js";

export class PageTrabyterTokenExplorer {
    #frontendId = "TraBucks_";
    #transactions = null;
    #tokenExplorer = null;
    #wasInitDone = false;
    #explorerMaxItemsPerPage = 10;
    #useFilterFromTokenExplorerInputField = false;
    #filterTxId = null;
    #filterByPrincipal = null;
    #filterByPrincipalCurrentShownLowIndex = 0;
    #filterByPrincipalCurrentShownHighIndex = 0;
    #explorerTxId_StartIndex = null;
    #totalTxCount = 0;


    async Init() {

        console.log("Page_TrabyterBucks_Init");
        if (this.#wasInitDone == true) {
            return;
        }

        // Some variables should be set to default values
        this.#explorerMaxItemsPerPage = 10;
        this.#explorerTxId_StartIndex = 0;
        this.#tokenExplorer = new TokenExplorer();
        await this.#tokenExplorer.Init(this.#frontendId, "be2us-64aaa-aaaaa-qaabq-cai", "zk4ae-aqaaa-aaaak-qiula-cai");

        document.getElementById(this.#frontendId + "rows_dropdown").onchange = async (event) => {
            let value = Number(event.target.value);
            this.#explorerMaxItemsPerPage = value;
            await this.Update_All_Views();
        };

        this.Remove_All_Events();

        let arrow_left_rewind = document.getElementById(this.#frontendId + "control-button-left-rewind");
        let arrow_left = document.getElementById(this.#frontendId + "control-button-left");
        let arrow_right = document.getElementById(this.#frontendId + "control-button-right");
        let arrow_right_forward = document.getElementById(this.#frontendId + "control-button-right-forward");
        let filter_input_field_control = document.getElementById(this.#frontendId + "token_explorer_input_field");


        filter_input_field_control.addEventListener("keypress", this.handleKeyPress.bind(this));

        // filter_input_field_control.addEventListener("keypress", async (event) => {            
        //     if (event.key === "Enter") {
        //         await this.#Update_All_Views_By_Filter();             
        //     }
        // });




        arrow_left_rewind.onclick = async (event) => {await this.Arrow_left_rewind_Click();};
        arrow_left.onclick = async (event) => { await this.Arrow_left_Click();};
        arrow_right.onclick = async (event) => { await this.Arrow_right_Click();};
        arrow_right_forward.onclick = async (event) =>  {await this.Arrow_right_forward_Click();};

        let button_token_Explorer_Filter = document.getElementById(this.#frontendId + "token_explorer_input_field_button");
        
        button_token_Explorer_Filter.onclick = async (event) => {await this.#Update_All_Views_By_Filter();};

        // button_token_Explorer_Filter.onclick = async (event) => {
        //     await this.#Update_All_Views_By_Filter();
        // };
        this.#wasInitDone = true;

        this.#RemoveAllSetFilters();
        this.#transactions = null;
        this.#explorerMaxItemsPerPage = 10;
        this.#totalTxCount = await this.#tokenExplorer.Get_TransactionsCount();
        this.#explorerTxId_StartIndex = Math.max(Number(this.#totalTxCount) - Number(1), Number(0));
        await this.Update_All_Views();
    }

    async Remove_All_Events() {
        let arrow_left_rewind = document.getElementById(this.#frontendId + "control-button-left-rewind");
        let arrow_left = document.getElementById(this.#frontendId + "control-button-left");
        let arrow_right = document.getElementById(this.#frontendId + "control-button-right");
        let arrow_right_forward = document.getElementById(this.#frontendId + "control-button-right-forward");
        let filter_input_field_control = document.getElementById(this.#frontendId + "token_explorer_input_field");
        let button_token_Explorer_Filter = document.getElementById(this.#frontendId + "token_explorer_input_field_button");
        
        if (button_token_Explorer_Filter != null) {
            button_token_Explorer_Filter.onclick = null;
        }
        

        if (filter_input_field_control != null) {
            filter_input_field_control.removeEventListener("keypress", this.handleKeyPress.bind(this));
        }

        if (arrow_left_rewind != null) {
            arrow_left_rewind.onclick = null;
        };

        if (arrow_left != null) {
            arrow_left.onclick = null;
        };

        if (arrow_right != null) {
            arrow_right.onclick = null;
        };

        if (arrow_right_forward != null) {
            arrow_right_forward.onclick = null;
        };

    };

    async Arrow_left_rewind_Click() {
        if (this.#useFilterFromTokenExplorerInputField == true && this.#filterTxId != null) {
            this.#RemoveAllSetFilters();
        }

        var totalTx = 0;
        if (this.#filterByPrincipal != null) {
            totalTx = await this.#tokenExplorer.Get_TransactionsByPrincipalCount(this.#filterByPrincipal);
        }
        else {
            totalTx = await this.#tokenExplorer.Get_TransactionsCount();
        }
        this.#explorerTxId_StartIndex = Math.max(Number(totalTx) - 1, 0);


        await this.Update_All_Views();
    };

    async Arrow_left_Click() {
        if (this.#useFilterFromTokenExplorerInputField == true && this.#filterTxId != null) {

            this.#RemoveAllSetFilters();
        }

        this.#explorerTxId_StartIndex = Math.max(Number(this.#explorerTxId_StartIndex) + Number(this.#explorerMaxItemsPerPage), 0);
        await this.Update_All_Views();
    };

    async Arrow_right_Click() {        
        if (this.#useFilterFromTokenExplorerInputField == true && this.#filterTxId != null) {
            this.#RemoveAllSetFilters();
        }
        this.#explorerTxId_StartIndex = Math.max(Number(this.#explorerTxId_StartIndex) - Number(this.#explorerMaxItemsPerPage), 0);
        await this.Update_All_Views();
    };

    async Arrow_right_forward_Click() {
        if (this.#useFilterFromTokenExplorerInputField == true && this.#filterTxId != null) {
            this.#RemoveAllSetFilters();

        }
        this.#explorerTxId_StartIndex = Math.max(Number(this.#explorerMaxItemsPerPage) - 1, 0);
        await this.Update_All_Views();
    };

    async handleKeyPress(event) {
        if (event.key === "Enter") {
            await this.#Update_All_Views_By_Filter();
        }
    }

    #Get_shown_first_tx_index() {

        if (this.#transactions == null || this.#transactions.length == 0) {
            return 0;
        }
        return this.#transactions[0].txIndex;
    }

    #Get_shown_last_tx_index() {

        if (this.#transactions == null || this.#transactions.length == 0) {
            return 0;
        }
        let shownTxLength = this.#transactions.length;

        return this.#transactions[shownTxLength - 1].txIndex;
    }

    async #Update_All_Views_By_Filter() {

        let filterInputFieldControl = document.getElementById(this.#frontendId + "token_explorer_input_field");
        let textValue = filterInputFieldControl.value;

        if (this.#isNullOrWhiteSpace(textValue)) {

            this.#RemoveAllSetFilters();
            this.#totalTxCount = await this.#tokenExplorer.Get_TransactionsCount();
            this.#explorerTxId_StartIndex = Math.max(Number(this.#totalTxCount) - Number(1), Number(0));
            await this.Update_All_Views();

        } else if (this.#IsStringANumber(textValue)) {

            this.#useFilterFromTokenExplorerInputField = true;
            this.#filterTxId = Number(textValue);
            this.#filterByPrincipal = null;
            this.#explorerTxId_StartIndex = Number(textValue);
            await this.Update_All_Views();
        } else {
            this.#useFilterFromTokenExplorerInputField = true;
            this.#filterTxId = null;
            this.#filterByPrincipal = textValue;
            let txCount = await this.#tokenExplorer.Get_TransactionsByPrincipalCount(this.#filterByPrincipal);
            let index = Math.max(Number(txCount) - 1, 0);
            this.#explorerTxId_StartIndex = index;
            await this.Update_All_Views();
        };
    };

    async Update_All_Views() {

        // Get the transactions count                   
        if (this.#filterByPrincipal != null) {
            this.#totalTxCount = await this.#tokenExplorer.Get_TransactionsByPrincipalCount(this.#filterByPrincipal);
        } else {
            this.#totalTxCount = await this.#tokenExplorer.Get_TransactionsCount();
        }

        // Get the transactions 

        let relIndex = Number(Number(this.#explorerTxId_StartIndex) - Number(this.#explorerMaxItemsPerPage) + Number(1));
        let minNumber = Number(0);
        let txStartIndex = Number(Math.max(relIndex, minNumber));

        let lengthToUse = Number(this.#explorerMaxItemsPerPage);
        if (Number(this.#explorerTxId_StartIndex) - lengthToUse + 1 < 0) {
            lengthToUse = Number(this.#explorerTxId_StartIndex) + 1;
            txStartIndex = 0;
        }
        if (this.#filterByPrincipal != null) {
            this.#transactions = await this.#tokenExplorer.Get_TransactionsByPrincipal(this.#filterByPrincipal, txStartIndex, Number(lengthToUse));

        } else {
            this.#transactions = await this.#tokenExplorer.Get_Transactions(txStartIndex, Number(lengthToUse));
        }

        await this.#Update_TokenExplorerItems();
        await this.#Update_Transactions_Legends();

    }

    async #Update_Transactions_Legends() {
        // The highest index of the transactions shown
        let shownHighestTxIndex = this.#Get_shown_first_tx_index();

        // The lowest index of the transactions shown
        let shownLowestTxIndex = this.#Get_shown_last_tx_index();

        if (this.#useFilterFromTokenExplorerInputField == true && this.#filterByPrincipal != null) {
            shownHighestTxIndex = this.#explorerTxId_StartIndex;

            shownLowestTxIndex = this.#explorerTxId_StartIndex - this.#transactions.length + 1;
        }

        let arrow_left_rewind = document.getElementById(this.#frontendId + "control-button-left-rewind");
        let arrow_left = document.getElementById(this.#frontendId + "control-button-left");
        let arrow_right = document.getElementById(this.#frontendId + "control-button-right");
        let arrow_right_fastforward = document.getElementById(this.#frontendId + "control-button-right-forward");
        if (arrow_left_rewind != null) {

            if (shownHighestTxIndex + 1 < this.#totalTxCount) {
                arrow_left_rewind.className = "control-button-left-rewind-highlight";
            } else {
                arrow_left_rewind.className = "control-button-left-rewind";
            }
        }

        if (arrow_left != null) {
            if (shownHighestTxIndex + 1 < this.#totalTxCount) {
                arrow_left.className = "control-button-left-highlight";
            } else {
                arrow_left.className = "control-button-left";
            }
        }

        if (arrow_right != null) {
            if (shownLowestTxIndex > 0) {
                arrow_right.className = "control-button-right-highlight";
            } else {
                arrow_right.className = "control-button-right";
            }
        }
        if (arrow_right_fastforward != null) {
            if (shownLowestTxIndex > 0) {
                arrow_right_fastforward.className = "control-button-right-forward-highlight";
            } else {
                arrow_right_fastforward.className = "control-button-right-forward";
            }
        }
    }

    async #Update_TokenExplorerItems() {

        let id = this.#frontendId + "TokenExplorer";
        let tableElement = document.getElementById(id);

        if (tableElement == null) {
            return;
        }

        let tableHtmlString = this.#Get_TokenExplorerTableStartContentString();

        if (this.#transactions != null && this.#transactions.length > 0) {

            for (let i = 0; i < this.#transactions.length; i++) {
                let model = this.#transactions[i];
                let rowString = this.#Get_TokenExplorerTableRowStringByModel(model);
                tableHtmlString += rowString;
            }
        };

        tableHtmlString += this.#Get_TokenExplorerTableEndContentString();
        tableElement.innerHTML = tableHtmlString;
        tableElement.style.display = "block";
    }


    #Get_TokenExplorerTableEndContentString() {

        return " </table>";
    }

    #Get_TokenExplorerTableStartContentString() {

        let returnString = `
            <table cellspacing='0em' cellpadding='0em'  
            style='width: 100%; 
            padding-left: 1em; padding-right: 1em;'>
                <colgroup>
                    <col style='width: 10em; min-width: 10em;'>
                    <col style='width: 20em; min-width: 20em;'>
                    <col style='width: 10em; min-width: 10em;'>
                    <col style='width: 15em; min-width: 15em;'>
                    <col style='width: 45em; min-width: 45em;'>
                    <col style='width: auto; min-width: 45em;'>
                </colgroup>

                <tr>
                    <td >
                        <p class='control-table-header-text'>Tx Id</p>
                    </td>
                    <td >
                        <p class='control-table-header-text'>Date</p>
                    </td>
                    <td >
                        <p class='control-table-header-text'>Type</p>
                    </td>
                    <td >
                        <p class='control-table-header-text'>Amount</p>
                    </td>
                    <td >
                        <p class='control-table-header-text'>From</p>
                    </td>
                    <td >
                        <p class='control-table-header-text'>To</p>
                    </td>

                    <td>

                    </td>
                </tr>
        
                <tr >
                    <td colspan='6' >
                        <div style='width: 100%;height: 0.2em; background-color: white;vertical-align: top;'></div>
                    </td>
                </tr>
                <tr style='height: 2em;'>
                    <td></td>
                </tr>`;

        return returnString;
    }

    #Get_amount_string(amount) {
        let returnValue = Number(amount).toFixed(3);
        return returnValue;
    }

    #Get_TokenExplorerTableRowStringByModel(model) {

        let returnString = `
        <tr class='spaceUnder' >                          
            <td colspan='6'>
                <div class='control-table-cell-div-content'  >
                    <table cellspacing='0em' cellpadding='0em' style='width: 100%;'  >
                        <colgroup>
                            <col style='width: 10em; min-width: 10em;'>
                            <col style='width: 20em; min-width: 20em;'>
                            <col style='width: 10em; min-width: 10em;'>
                            <col style='width: 15em; min-width: 15em;'>
                            <col style='width: 45em; min-width: 45em;'>
                            <col style='width: auto; min-width: 45em;'>
                        </colgroup>
                        <tr style='margin: 0em; padding: 0em;'>
                            <td style='padding-left: 1em;padding-top: 0.1em; vertical-align: top;text-align: right;'>
                                <p class='control-table-cell-text'
                                style='text-align: right;margin-right: 2em;'
                                >` + model.txIndex + `</p>
                            </td>
                            <td style='vertical-align: top;padding-top: 0.1em;'>
                                <p class='control-table-cell-text'>` + model.DateTimeString + `</p>
                            </td>
                            <td style='vertical-align: top;padding-top: 0.1em; '>
                                <p class='control-table-cell-text'>` + model.TransactionType + `</p>
                            </td>
                            <td style='vertical-align: top;padding-top: 0.1em;'>
                                <p class='control-table-cell-text'>` + this.#Get_amount_string(model.Amount) + ` TRA</p>
                            </td>                                                    
                            <td style='vertical-align: top;padding-top: 0.1em;'>
                                <p class='control-table-cell-text'>` + model.From + `</p>
                            </td>
                            <td style='vertical-align: top;padding-top: 0.1em;'>
                                <p class='control-table-cell-text'>` + model.To + `</p>
                            </td>                                                                                                                                                                          
                        </tr>
                        <tr>
                            <td>

                            </td>
                        </tr>
                    </table>                                              
                </div> 
            </td>                                                                                                                                                                                            
        </tr>`;
        return returnString;
    }

    #IsStringANumber(str) {
        let isNumber = !isNaN(parseFloat(str)) && isFinite(str);
        if (isNumber == false) {
            return false;
        };
        return true;

    };

    #IsStringIsAPositiveNumber(str) {
        let isNumber = !isNaN(parseFloat(str)) && isFinite(str);
        if (isNumber == false) {
            return false;
        };
        let number = Number(str);
        if (number < 0) {
            return false;
        };
        return true;

    };

    #RemoveAllSetFilters() {
        this.#useFilterFromTokenExplorerInputField = false;
        this.#filterTxId = null;
        this.#filterByPrincipal = null;
        document.getElementById(this.#frontendId + "token_explorer_input_field").value = "";

    };

    #isNullOrWhiteSpace(str) {
        return str === null || str === undefined || str.replace(' ', '').length === 0;
    };


};
