// Google Cloud Function Handler for Celesitial Components handling CRUD activities.
// Example of this would be to add/delete/update minerals or ore within the primary database.
// -kareemjg @ 6/14/2019

//******************************************************************************************/
//****************************** IMPORTS & DECLARATIONS ************************************/
//******************************************************************************************/

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as sentry from "@sentry/node";
import { IComponents} from "../models/components.model";
import { makeDBKey, checkIfNull } from "./helper";
import { myVariables} from "./myVariables";
import { logIt} from "./logger";


const serviceAccount = require(myVariables.FIREBASE_KEYFILE);


// Initialize Sentry.IO Exeception Logging
sentry.init({ dsn: myVariables.SENTRY_DSN });

//TODO Need to move this to a global file. It does not work in the index and cannot be called in each function.
// Initialize Google Firestore Access
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: myVariables.FIREBASE_DATABASE_URL
});



// This is the Firebase Cloud Firestore
const database = admin.firestore();


/**
 * Looks up component type and maps it to firebase reference table
 */
class firestoreComponentsReference{

  collectionPrimary : string = '';
  docPrimary: string = '';
  collectionSecondary: string = '';
  //docSecondary: string = '';
  message: string = '';
  status: number = 0;

  constructor (_componentType: string) {

    this.collectionPrimary = myVariables.FIRESTORE_REF_COMPONENTS;
    
    switch(_componentType) { 
       case myVariables.COMPONENT_MINERAL: {
           this.status = myVariables.API_OKAY;
           this.docPrimary = myVariables.FIRESTORE_REF_COMPONENTS_PLANETARY;
           this.collectionSecondary = myVariables.FIRESTORE_REF_COMPONENTS_PLANETARY_MINERAL;
           break;
        } 
    default: {
      this.status = myVariables.API_ERROR;
      this.message ='ERROR. Unable to determine component type.';
      logIt(myVariables.LOG_ERROR, this.message);
      this.docPrimary = 'ERROR';
      break; 
     } 
    } 
  }
}

//******************************************************************************************/
//******************************         EXPORTS        ************************************/
//******************************************************************************************/

/**
 * Add new components to Firestore Database
 * @param req
 * @param res
 */
export function addComponentsToDatabase(req: functions.Request, res:functions.Response) {

    logIt(myVariables.LOG_INFO, 'addComponentToDatabase initiated');

    const data: IComponents = req.body;
    const firestoreRefs = new firestoreComponentsReference(data.componentType);

    data.componentID = makeDBKey(data.componentName, data.componentType , '');

    logIt(myVariables.LOG_INFO, req.body.toString());


      database
          .collection(firestoreRefs.collectionPrimary)
          .doc(firestoreRefs.docPrimary)
          .collection(firestoreRefs.collectionSecondary)
          .doc(data.componentID)
          .set(data)
          .then((entity) => {
            res.status(myVariables.API_OKAY).send(entity);
          }).catch((error) => {
          logIt(myVariables.LOG_ERROR, error);
            res.status(myVariables.API_ERROR).send(error);
          });

}

/**
 * Look up Component by componentID and componenType
 * @param req
 * @param res
 */
export function getComponentInfoByID(req: functions.Request, res:functions.Response) {

    logIt(myVariables.LOG_INFO, 'getComponentInfoByID initiated');

    // To do a lookup by ID will require the component ID and componentType

    const data: IComponents = req.body;

    if (!checkIfNull(data.componentID) && !checkIfNull(data.componentType)) {
        logIt(myVariables.LOG_INFO, 'Looking up info Type:'+ data.componentType + ' ID:' + data.componentID);

        const firestoreRefs = new firestoreComponentsReference(data.componentType);

        database
            .collection(firestoreRefs.collectionPrimary)
            .doc(firestoreRefs.docPrimary)
            .collection(firestoreRefs.collectionSecondary)
            .doc(data.componentID)
            .get()
            .then((entity) => {
                if (!entity.exists) {
                    const message = {'error': 'Entity can not be found.'};
                    logIt(myVariables.LOG_ERROR, message);
                    res.status(myVariables.API_ERROR).send(message);
                    {
                        res.status(myVariables.API_OKAY).send(entity);
                    }
                }
            }).catch((error) => {
            logIt(myVariables.LOG_ERROR, error);
            res.status(myVariables.API_ERROR).send(error);
        });

    } else {
        const message = {'error': 'ComponentID and/or ComponentType was Null'};
        logIt(myVariables.LOG_ERROR, message);
        res.status(myVariables.API_ERROR).send(message);
    }
}


/**
 * Get list of components by collection. Requires componentType
 * @param req
 * @param res
 */
export function getListOfComponents(req: functions.Request, res:functions.Response) {

    logIt(myVariables.LOG_INFO, 'getListOfComponents initiated');

    const data: IComponents = req.body;
    let authHeader: string | undefined = '';
    authHeader = req.headers.authorization;

    verifyToken(authHeader);

    if (!checkIfNull(data.componentType)) {
        const firestoreRefs = new firestoreComponentsReference(data.componentType);

        database
            .collection(firestoreRefs.collectionPrimary)
            .doc(firestoreRefs.docPrimary)
            .collection(firestoreRefs.collectionSecondary)
            .get()
            .then(entity => {
                const jsonArrayObject:any = [];
                entity.forEach(doc => {
                  jsonArrayObject.push(doc.data());  //<-- notice the .data();
                } )
                res.status(myVariables.API_OKAY).send(jsonArrayObject);
            })
            .catch(error => {
                logIt(myVariables.LOG_ERROR, error);
                res.status(myVariables.API_ERROR).send(error);
            });

    }
    else {
        const message = {'error': 'ComponentType was Null'};
        logIt(myVariables.LOG_ERROR, message);
        res.status(myVariables.API_ERROR).send(message);
    }

}

/**
 * Update single component in database. Requires componentID and componentType
 * @param req
 * @param res
 */
export function updateSingleComponentInDatabase(req: functions.Request, res:functions.Response) {
    
    logIt(myVariables.LOG_INFO, 'updateSingleComponentsInDatabase initiated');

    const data: IComponents = req.body;

    //TODO need to add error checking to make sure required data is in place.
    const firestoreRefs = new firestoreComponentsReference(data.componentType);

    database
        .collection(firestoreRefs.collectionPrimary)
        .doc(firestoreRefs.docPrimary)
        .collection(firestoreRefs.collectionSecondary)
        .doc(data.componentID)
        .update(data)
        .then((entity) => {
            res.status(myVariables.API_OKAY).send(entity);
        }).catch((error) => {
        logIt(myVariables.LOG_ERROR, error);
        res.status(myVariables.API_ERROR).send(error);
    });

    res.status(myVariables.API_OKAY)
}


//******************************************************************************************/
//******************************    TEST EXPORTS        ************************************/
//******************************************************************************************/

/**
 * Test Component Creation Script
 * @param req
 * @param res
 */
export function testComponents(req: functions.Request, res: functions.Response) {

    console.log('testCelestialComponents initiated');
  //  const _componentType = "MineralType";


  const testCelestialComponentData = {
    componentName: 'TestMineral2',
    componentDescription: 'THis is a rare test mineral.',
    componentCubicVolume: 0.1,
    componentClassification: 'MineralType',
    componentIsTest: true,
    componentIsRefinable: false,
  };

  const _componentID = makeDBKey(testCelestialComponentData.componentName,'','');

  console.log(testCelestialComponentData);

  database
      .collection('Components')
      .doc('PlanetaryComponents')
      .collection('Minerals')
      .doc(_componentID)
      .set(testCelestialComponentData)
      .then((entity) => {

        res.status(myVariables.API_OKAY).send(entity);
      }).catch((error) => {
      logIt(myVariables.LOG_ERROR, error);
        res.status(myVariables.API_ERROR).send(error);
  });


  return;
}

function verifyToken(token : any){
    admin.auth().verifyIdToken(token)
        .then(function(decodedToken) {
            let uid = decodedToken.uid;
            logIt(myVariables.LOG_INFO, 'Token UID: ' + uid);
        }).catch(function(error) {
        logIt(myVariables.LOG_ERROR, error);
    });
}