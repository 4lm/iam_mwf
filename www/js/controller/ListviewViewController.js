/**
 * @author Jörn Kreutel
 */
import { mwf } from "../Main.js";
import { entities } from "../Main.js";


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
        this.switchCRUDElement = this.root.querySelector("footer .mwf-img-refresh");
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

        // Create and add new media item
        this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");
        this.addNewMediaItemElement.onclick = (() => {
            // this.crudops
            // .create(new entities.MediaItem(
            //         "m",
            //         "https://placeimg.com/100/100/city"))
            // .then((created) => this.addToListview(created));
            // this.createNewItem();
            this.nextView("mediaEditview");
        });


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

        // this.crudops.readAll().then((items) => {
        //     this.initialiseListview(items);
        // });

        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });

        // call the superclass once creation is done
        super.oncreate();
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    // bindListItemView(viewid, itemview, item) {
    //     // TODO: implement how attributes of item shall be displayed in itemview
    //     const added = new Date(item.added).toLocaleDateString('de-DE', dateOptions);
    //     itemview.root.querySelector("h2").textContent = item.title + item._id;
    //     itemview.root.getElementsByTagName("h3")[0].textContent = added;
    //     itemview.root.querySelector("img").src = item.src;
    // }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    // onListItemSelected(listitem, listview) {
    //     // TODO: implement how selection of listitem shall be handled
    //     this.nextView("mediaReadview", { item: listitem });
    // }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(option, listitem, listview) {
        // TODO: implement how selection of option for listitem shall be handled
        super.onListItemMenuItemSelected(option, listitem, listview);
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialog, item) {
        // call the supertype function
        super.bindDialog(dialogid, dialog, item);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

    /*
     * for views that initiate transitions to other views
     */
    async onReturnFromSubview(subviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
        console.log("onReturnFromSubview Listview", subviewid, returnValue, returnStatus);
        if (subviewid == "mediaReadview") {
            entities.MediaItem.readAll().then(items => this.initialiseListview(items));
            if (returnStatus == "deleted" && returnValue) {
                this.removeFromListview(returnValue.deletedItem._id);
            }
        } else if (subviewid == "mediaEditview") {
            if (returnStatus == "created" && returnValue) {
                this.addToListview(returnValue.item);
            } else if (returnStatus == "updated" && returnValue) {
                this.updateInListview(returnValue.item._id, returnValue.item);
            } else if (returnStatus == "deleted" && returnValue) {
                this.removeFromListview(returnValue.deletedItem._id);
            }
        }
    }

    // deleteItem(item) {
    //     // this.crudops.delete(item._id).then(() => {
    //     //     this.removeFromListview(item._id);
    //     // });
    //     item.delete().then(() => this.removeFromListview(item._id));
    // }

    deleteItemDialog(item) {
        this.showDialog("mediaItemDeleteDialog", {
            item: item,
            actionBindings: {
                cancelDeleteItem: ((event) => {
                    this.hideDialog();
                }),
                deleteItem: ((event) => {
                    // this.deleteItem(item);
                    item.delete().then(() => {
                        this.notifyListeners(new mwf.Event("crud", "deleted", "MediaItem", item._id));
                    });
                    this.hideDialog();
                    entities.MediaItem.readAll().then(items => this.initialiseListview(items));
                })
            }
        })
    }

    editItemDialog(item) {
        this.showDialog("mediaItemDialog", {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.update().then(() => {
                        this.updateInListview(item._id, item);
                    });
                    this.hideDialog();
                }),
                deleteItem: ((event) => {
                    this.deleteItemDialog(item);
                })
            }
        })
    }

    // createNewItem() {
    //     const url = "https://placeimg.com/300/400/city";
    //     const newItem = new entities.MediaItem("", url);
    //     this.showDialog("mediaItemDialog", {
    //         item: newItem,
    //         actionBindings: {
    //             submitForm: ((event) => {
    //                 event.original.preventDefault();
    //                 newItem.create().then(() => this.addToListview(newItem));
    //                 this.hideDialog();
    //             })
    //         }
    //     });
    // }

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
