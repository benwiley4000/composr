/**
 * @author Matan Zohar / matan.zohar@autodesk.com
 */

import store from 'store';
import {updateData, updateMetadata, registerObjectType} from 'actions/mainActions'
import {resetScene, updatePlayback, updateDisplay, setRenderElement} from 'actions/sceneActions';
import {remoteFetch, remoteSuccess} from 'actions/remoteActions';
import { routerActions } from 'react-router-redux';
import VisController from 'js/VisController';

import SceneParser from 'Parsers/SceneParser';
import DataSourceParser from 'Parsers/DataSourceParser';
import MetadataParser from 'Parsers/MetadataParser';
import Firebase from 'firebase/firebase';

class StoreAPI {
    // Scene Objects actions
    static getObjectById(uuid) {
        return store.getState().runtime.instances[uuid];
    }

    static getObjectByType(type) {
        return store.getState().runtime[type];
    }

    static getController() {
        return store.getState().runtime['controller'][0];
    }

    static getPlaybackState() {
        return store.getState().runtime.playback;
    }

    static getMetadata() {
        return store.getState().metadata;
    }

    static updateMetadata(newData) {
        store.dispatch(updateMetadata(newData));
    }

    static updateDisplaySettings(newData) {
        store.dispatch(updateDisplay(newData));
    }

    static getActiveCamera() {
        return StoreAPI.getActiveComposeCamera().camera;
    }

    static setActiveCamera(composeCamera) {
        store.dispatch(updatePlayback({ activeCamera: composeCamera.uuid }));
    }

    static getActiveComposeCamera() {
        return  StoreAPI.getObjectById(store.getState().runtime.playback.get('activeCamera'));
    }

    static getRenderElement() {
        return store.getState().runtime.visualizerElement;
    }

    // Scene Controls actions
    static initVisualizer(element) {
        store.dispatch(setRenderElement(element));

        const controller = StoreAPI.getController();

        controller.init();
        element.innerHTML = "";
        element.appendChild(controller.renderer.domElement);
    }

    static reset() {
        const element = StoreAPI.getController().parentElement;
        store.dispatch(resetScene());

        new VisController();
        StoreAPI.initVisualizer(element);

        StoreAPI.getController().render();
    }

    static exportToJson() {
        const state = store.getState();

        localStorage.setItem('openComposer',  JSON.stringify({
            scene: state.scene.toJS(),
            dataSource: state.dataSource.settings.toJS(),
            metadata: state.metadata.toJS()
        }));

        return {
            scene: state.scene.toJS(),
            dataSource: state.dataSource.settings.toJS(),
            metadata: state.metadata.toJS()
        }
    }

    static loadState(state) {
        store.dispatch(updatePlayback({ isPlaying: false }));
        SceneParser.fromJSON( state.scene );
        DataSourceParser.fromJSON(state.dataSource);
        MetadataParser.fromJSON(state.metadata);
        console.log('loading state metadata ' + state.metadata);

        setTimeout( () => {
            store.dispatch(updatePlayback({ isPlaying: true }));
        }, 1)
    }

    static saveStateRemote(remotePath) {
        store.dispatch(remoteFetch());
        Firebase.setCompData(StoreAPI.exportToJson()).then(
            () => store.dispatch(remoteSuccess())
        )
    }

    // load template from server
    static loadStateRemote(callback) {
        store.dispatch(remoteFetch());

        const dataRequest = Firebase.getCompData();

        if (dataRequest) {
            dataRequest.then(
                (data) => {
                    if (data.val() != null) {
                        StoreAPI.loadState(data.val());
                    } else {
                        StoreAPI.replacePath('/404.html')
                    }

                    store.dispatch(remoteSuccess());

                    if (callback) callback(data);
                });
        }
    }

    // listen to changes on the server for this template
    static listenRemote(uid, compId) {
        Firebase.onChange(`/private/${uid}/${compId}`, (data) => {
            if (data != null) {
                StoreAPI.loadState(data);
            }
        });
    }


    // data source actions
    static getCurrentData() {
        return store.getState().dataSource.data;
    }

    static pushDataSourceBuffer(buffer) {
        store.dispatch(updateData(buffer));
    }

    static registerObjectClass(name, classObject) {
        store.dispatch(registerObjectType(name, classObject, classObject.type()));
    }

    static getObjectClassesByType(type) {
        return window.store.getState().runtime.objectTypes[type];
    }

    // user actions
    static getCurrentUser() {
        return store.getState().currentUser;
    }

    static replacePath(newPath) {
        store.dispatch(routerActions.replace(newPath));
    }

}

export default StoreAPI;