/**
 * @author Jörn Kreutel
 */
import { mwf } from "../Main.js";
import { entities } from "../Main.js";
import { mwfUtils } from "../Main.js";


export default class ListviewViewController extends mwf.ViewController {

    constructor() {
        super();
        console.log("ListviewViewController()");
        this.addNewMediaItem = null;
        this.resetDatabaseElement = null;
    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        console.log("oncreate(): root is:", this.root);

        // Add current CRUD scope (local|remote) to footer 
        this.currentCRUDScopeInfo = this.root.querySelector("#currentCRUDScope");
        this.currentCRUDScopeInfo.innerHTML = this.application.currentCRUDScope;

        // Add CRUD scope (local|remote) switcher 
        this.switchCRUDElement = this.root.querySelector("#switchCRUDElement");
        this.switchCRUDElement.onclick = () => {
            const scope = this.application.currentCRUDScope;
            const local = this.application.CRUDOPS.LOCAL;
            const remote = this.application.CRUDOPS.REMOTE;
            if (scope === remote) {
                this.application.switchCRUD(local);
                this.currentCRUDScopeInfo.innerHTML = this.application.currentCRUDScope;
            } else {
                this.application.switchCRUD(remote);
                this.currentCRUDScopeInfo.innerHTML = this.application.currentCRUDScope;
            }
            entities.MediaItem.readAll().then(items => this.initialiseListview(items));
        }

        // Callback method for toggeling to the correct element
        function toggleCorrectElement(isServerOnline) {
            if (isServerOnline == true) {
                const offlineIndicator = document.getElementById("offlineIndicator");
                offlineIndicator.style.display = "none";
            } else {
                const switchCRUDElement = document.getElementById("switchCRUDElement");
                switchCRUDElement.style.display = "none";
            }
        }

        // Check if connection to Webserver exists and act accordingly
        mwfUtils.isWebserverAvailable(toggleCorrectElement);

        // Create and add new media item
        this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");
        this.addNewMediaItemElement.onclick = (() => this.nextView("mediaEditview"));

        // Delete IndexedDB
        this.deleteIndexedDBElement = this.root.querySelector("#deleteIndexedDB");
        this.deleteIndexedDBElement.onclick = (() => {
            const scope = this.application.currentCRUDScope;
            const local = this.application.CRUDOPS.LOCAL;
            if (scope === local) {
                const dbname = this.application.DBNAME;
                this.deleteIndexedDBDialog(dbname);
            }
        });

        this.addListener(
            new mwf.EventMatcher("crud", "created", "MediaItem"),
            ((event) => this.addToListview(event.data))
        );

        this.addListener(
            new mwf.EventMatcher("crud", "updated", "MediaItem"),
            ((event) => this.updateInListview(event.data._id, event.data))
        );

        this.addListener(
            new mwf.EventMatcher("crud", "deleted", "MediaItem"),
            ((event) => this.removeFromListview(event.data))
        );

        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });

        // call the superclass once creation is done
        super.oncreate();
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified
     * by targetview/targetaction
     */
    onListItemMenuItemSelected(option, listitem, listview) {
        // TODO: implement how selection of option for listitem shall be handled
        super.onListItemMenuItemSelected(option, listitem, listview);
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or
     * if generic controllerfor dialogs is employed
     */
    bindDialog(dialogid, dialog, item) {
        // call the supertype function
        super.bindDialog(dialogid, dialog, item);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

    /*
     * Dialog that appears after hitting "Löschen" in item action menu
     */
    deleteItemDialog(item) {
        this.showDialog("mediaItemDeleteDialog", {
            item: item,
            actionBindings: {
                cancelDeleteItem: ((event) => {
                    this.hideDialog();
                }),
                deleteItem: ((event) => {
                    item.delete().then(() => this.hideDialog());
                })
            }
        })
    }

    /*
     * Dialog that appears after hitting "Editieren" in item action menu
     */
    editItemDialog(item) {
        this.showDialog("mediaItemDialog", {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.update().then(() => this.hideDialog());
                }),
                deleteItem: ((event) => {
                    this.deleteItemDialog(item);
                })
            }
        })
    }

    /*
     * Dialog that appears after hitting the hamburger button,
     * if scope is local
     */
    deleteIndexedDBDialog(dbname) {
        this.showDialog("deleteIndexedDBDialog", {
            dbname: dbname,
            actionBindings: {
                cancelDeleteDatabase: ((event) => {
                    this.hideDialog();
                }),
                deleteDatabase: ((event) => {
                    this.hideDialog();
                    indexedDB.deleteDatabase(dbname);
                    location.reload(true);
                })
            }
        })
    }

}
