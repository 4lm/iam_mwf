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

        this.mediaItem = (this.args && this.args.item) ? this.args.item : new entities.MediaItem();

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
                            this.notifyListeners(new mwf.Event("crud", "deleted", "MediaItem", this.mediaItem._id));
                            this.previousView();
                        });
                    })
                }
            })
        }));

        // TODO: do databinding, set listeners, initialise the view
        this.preview = this.root.querySelector("main .my-preview");
        this.editForm = this.root.querySelector("main form");
        this.urlInput = this.editForm.url;
        this.fileInput = this.editForm.srcUpload;

        this.urlInput.onblur = () => {
            this.preview.src = this.urlInput.value;
        };

        this.fileInput.onchange = () => {

            if (this.fileInput.files[0]) {
                const objecturl = URL.createObjectURL(this.fileInput.files[0]);
                const contentType = this.fileInput.files[0].type;

                this.mediaItem.src = objecturl;
                this.mediaItem.contentType = contentType;
                this.viewProxy.update({ item: this.mediaItem });
                this.preview = this.root.querySelector("main .my-preview");
                this.preview.src = objecturl;
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

    async onpause() {

        if (this.preview && this.preview.tagName == "VIDEO" && !this.preview.paused && !this.preview.ended) {
            this.preview.pause();
        }

        super.onpause();
    }

    createOrEditMediaItem() {

        // If mediaItem already exists, then update.
        if (this.mediaItem.created) {
            this.mediaItem.update().then(() => {
                this.notifyListeners(new mwf.Event("crud", "updated", "MediaItem", this.mediaItem._id));
                this.previousView({ item: this.mediaItem }, "updated");
            });
        }
        // Else, newly create mediaItem.
        else {
            this.mediaItem.create().then(() => {
                this.previousView();
            });
        }

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

}
