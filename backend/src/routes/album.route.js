import { Router } from "express";
const router = Router();
import {getAllAlbums, getAlbumById} from "../controller/album.controller.js";


router.get("/", getAllAlbums);
router.get("/:albumId", getAlbumById);


export default router;