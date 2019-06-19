/**
 * @author Jörn Kreutel
 */
import { mwf } from "../Main.js";
import { entities } from "../Main.js";

export default class EditviewViewController extends mwf.ViewController {

    constructor() {
        super();

        console.log("EditviewViewController()");
    }

    /*
     * for any view: initialise the view
     *
     * In case of editing an existing item, the framework passes an
     * object of the form {item: mediaItem}, where mediaItem is the
     * item to be edited.
     * 
     */
    async oncreate() {

        // Ternary check of edit and create cases
        this.mediaItem = (this.args && this.args.item) ? this.args.item : new entities.MediaItem();

        // Alternativ, to above ternary operator:
        //
        // // Edit case
        // if (this.args && this.args.item) {
        //     this.mediaItem = this.args.item;
        // }
        // // Create case
        // else {
        //     this.mediaItem = new entities.MediaItem();
        // }

        // this.bindElement("mediaEditviewTemplate", { item: this.mediaItem }, this.root);

        this.viewProxy = this.bindElement(
            "mediaEditviewTemplate",
            { item: this.mediaItem },
            this.root
        ).viewProxy;

        this.viewProxy.bindAction("deleteItem", (() => {
            this.showDialog("mediaItemDeleteDialog", {
                item: this.mediaItem,
                actionBindings: {
                    cancelDeleteItem: ((event) => {
                        this.hideDialog();
                    }),
                    deleteItem: ((event) => {
                        this.hideDialog();
                        this.mediaItem.delete().then(() => {
                            this.previousView({ deletedItem: this.mediaItem }, "deleted");
                        });
                    })
                }
            })
        }));

        // TODO: do databinding, set listeners, initialise the view
        this.previewImg = this.root.querySelector("main img");
        this.editForm = this.root.querySelector("main form");
        this.urlInput = this.editForm.url;
        this.fileInput = this.editForm.srcUpload;

        this.urlInput.onblur = () => {
            this.previewImg.src = this.urlInput.value;
        };

        this.fileInput.onchange = () => {
            if (this.fileInput.files[0]) {
                const objecturl = URL.createObjectURL(this.fileInput.files[0]);
                //alert("selected image!: " + objecturl);
                // this.urlInput.value = objecturl;
                this.previewImg.src = objecturl;
                this.mediaItem.src = objecturl;
                this.viewProxy.update({ item: this.mediaItem });
            }
        };

        this.editForm.onsubmit = () => {

            if (this.fileInput.files[0]) {
                // enctype='multipart/form-data' is automatically set
                let data = new FormData();
                data.append("srcUpload", this.fileInput.files[0]);

                const xhreq = new XMLHttpRequest();
                xhreq.open("POST", "api/upload");
                xhreq.send(data);
                xhreq.onreadystatechange = () => {
                    if (xhreq.readyState == 4 && xhreq.status == 200) {
                        // alert("uploaded: " + xhreq.responseText);
                        const responsedata = JSON.parse(xhreq.responseText);
                        this.mediaItem.src = responsedata.data.srcUpload;
                        this.createOrEditMediaItem();
                    }
                };
            } else {
                this.createOrEditMediaItem();
            }

            return false;
        };



        // call the superclass once creation is done
        super.oncreate();
    }

    createOrEditMediaItem() {
        // alert("submit! mediaItem: " + JSON.stringify(this.mediaItem));

        // If mediaItem already exists, then update.
        if (this.mediaItem.created) {
            this.mediaItem.update().then(() => this.previousView({ item: this.mediaItem }, "updated"));
        }
        // Else, newly create mediaItem.
        else {
            this.mediaItem.create().then(() => this.previousView({ item: this.mediaItem }, "created"));
        }
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

