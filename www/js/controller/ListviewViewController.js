/**
 * @author Jörn Kreutel
 */
import { mwf } from "../Main.js";
import { entities } from "../Main.js";
import { GenericCRUDImplLocal } from "../Main.js";

export default class ListviewViewController extends mwf.ViewController {

    constructor() {
        super();
        console.log("ListviewViewController()");
        this.addNewMediaItem = null;
        this.resetDatabaseElement = null;
        
        this.crudops = GenericCRUDImplLocal.newInstance("MediaItem");
    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        console.log("oncreate(): root is:", this.root);
        this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");
        this.resetDatabaseElement = this.root.querySelector("#resetDatabase");

        this.addNewMediaItemElement.onclick = (() => {
            this.crudops
            .create(new entities.MediaItem(
                    "m",
                    "https://placeimg.com/100/100/city"))
            .then((created) => this.addToListview(created));
        });

        this.resetDatabaseElement.onclick = (() => {
            if (confirm("Soll die Datenbank wirklich zurückgesetzt werden?")) {
                indexedDB.deleteDatabase("mwftutdb");
            }
        });

        this.crudops.readAll().then((items) => {
            this.initialiseListview(items);
        });

        // call the superclass once creation is done
        super.oncreate();
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    bindListItemView(viewid, itemview, item) {
        // TODO: implement how attributes of item shall be displayed in itemview
        itemview.root.querySelector("h2").textContent = item.title + item._id;
        itemview.root.getElementsByTagName("h3")[0].textContent = item.added;
        itemview.root.querySelector("img").src = item.src;
    }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(listitem, listview) {
        // TODO: implement how selection of listitem shall be handled
        alert("Element " + listitem.title + listitem._id + " wurde ausgewählt!");
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(option, listitem, listview) {
        // TODO: implement how selection of option for listitem shall be handled
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
    }

}

