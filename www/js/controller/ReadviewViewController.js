/**
 * @author Jörn Kreutel
 */
import { mwf } from "../Main.js";
import { entities } from "../Main.js";

export default class ReadviewViewController extends mwf.ViewController {

    constructor() {
        super();
        console.log("ReadviewViewController()");
        this.viewProxy = null;

    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        console.log("ReadviewViewController() -> oncreate():");

        // TODO: do databinding, set listeners, initialise the view

        const mediaItem = this.args.item;

        this.viewProxy = this.bindElement(
            "mediaReadviewTemplate",
            { item: mediaItem },
            this.root
        ).viewProxy;

        this.viewProxy.bindAction("deleteItem", (() => {
            this.showDialog("mediaItemDeleteDialog", {
                actionBindings: {
                    cancelDeleteItem: ((event) => {
                        this.hideDialog();
                    }),
                    deleteItem: ((event) => {
                        this.hideDialog();
                        mediaItem.delete().then(() => {
                            this.previousView({ deletedItem: mediaItem });
                        });
                    })
                }
            })
        }));

        // call the superclass once creation is done
        super.oncreate();
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    bindListItemView(viewid, itemview, item) {
        // TODO: implement how attributes of item shall be displayed in itemview
    }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(listitem, listview) {
        // TODO: implement how selection of listitem shall be handled
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
