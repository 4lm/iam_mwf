/**
 * @author Jörn Kreutel
 *
 * this skript defines the data types used by the application and the model operations for handling instances of the latter
 */


import { mwfUtils } from "../Main.js";
import { EntityManager } from "../Main.js";

/*************
 * example entity
 *************/

export class MyEntity extends EntityManager.Entity {

    constructor() {
        super();
    }

}

export class MediaItem extends EntityManager.Entity {

    constructor(title, src, contentType) {
        super();
        this.title = title;
        this.description = "";
        this.added = Date.now();
        this.src = src;
        this.srcType = null;
        this.contentType = contentType;
    }

    // TODO: Add getter methods, from tutorial.pdf on page 24

}

