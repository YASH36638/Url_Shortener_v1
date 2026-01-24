import path from 'path';
import { postShortend } from '../Controller/control.js';
import { fileURLToPath } from 'url';
import { getInterface } from '../views/view.js';
import {Router} from 'express'
import express from 'express';
import { redirectLinks } from '../Model/codeFetch.js';
import * as authControllers from '../Controller/auth.Controller.js';

const router=Router();
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
export const R_DIR=ROOT_DIR;




router.get("/",getInterface)
router.use(express.static(path.join(ROOT_DIR,"public")));
router.route("/delete/:id").post(authControllers.deleteShortCode);
router.route("/edit/:id").get(authControllers.getEditPage).post(authControllers.postEdit);

router.post("/shorten", postShortend);
router.get("/:code",redirectLinks);



export const Shortened=router;