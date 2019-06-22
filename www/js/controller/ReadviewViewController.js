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
                item: mediaItem,
                actionBindings: {
                    cancelDeleteItem: ((event) => {
                        this.hideDialog();
                    }),
                    deleteItem: ((event) => {
                        this.hideDialog();
                        mediaItem.delete().then(() => {
                            this.notifyListeners(new mwf.Event("crud", "deleted", "MediaItem", mediaItem._id));
                            this.previousView();
                        });
                    })
                }
            })
        }));

        this.viewProxy.bindAction("editItem", (() => {
            this.nextView("mediaEditview", this.args);
        }));

        this.addListener(
            new mwf.EventMatcher("crud","deleted","MediaItem"),
            ((event) => this.markAsObsolete()),
            true
        );

        // call the superclass once creation is done
        super.oncreate();
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
        if (subviewid == "mediaEditview") {
            if (returnStatus == "updated" && returnValue) {
                this.viewProxy.update(returnValue);
            }
        }
    }

}
