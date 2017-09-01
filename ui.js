import * as ActionTypes from '../../actionTypes';
import Utilities from '../../../utilities';
import {
    flatten as _flatten,
    uniq as _uniq,
    findLastIndex as _findLastIndex,
    remove as _remove,
    sortedIndex as _sortedIndex
} from 'lodash';
import * as DocumentReducer from '../document/index';
import * as CommentReducer from '../comments';


export const INITIAL_STATE = {
    isFetching: false,
    isNameChangePending: false,
    isRemoveDocumentsPending: false,
    isAddDocumentsPending: false,
    isCreateObjectPending: false,
    isMarkDocumentReviewedPending: false,
    isCaseReorderDocumentsPending: false,
    isAcceptPending: false,
    isSaveEditsPending: false,
    isSaveObjectAssociationsPending: false,
    isDeleteObjectPending: false,
    isRenameObjectPending: false,
    id: -1,
    name: "",
    createdDate: "",
    status: "",
    documents: [],
    task:{isClaimable: false},
    objectTypes: [],
    objects: [],
    selectedDocumentIndex: -1,
    documentPreviewIndex: -1,
    activeEdits: [],
    highlightedTermId: "",
    terms: [],
    caseActions:[],
    filteredAlerts: false
};

export default function caseReducer(state = INITIAL_STATE, action){
    switch(action.type){
        case ActionTypes.GET_TASK_ID_FOR_HASH_SUCCESS:
            return (action.hash == state.id && action.task.data.length > 0 ? Object.assign({}, state, {task: action.task.data[0]}) : setStateViaExternalReducer(state,action));
        case ActionTypes.GET_CASE_PENDING:
            return Object.assign({},state,{isFetching:true, id:action.id});
        case ActionTypes.GET_CASE_SUCCESS:
            return setCase(state, action.case);
        case ActionTypes.GET_CASE_FAIL:
            return Object.assign({},state,{isFetching:false});
        case ActionTypes.CHANGE_CASE_NAME_PENDING:
            return Object.assign({},state,{isNameChangePending:true});
        case ActionTypes.CHANGE_CASE_NAME_SUCCESS:
            return Object.assign({},state,{isNameChangePending:false, name: action.name});
        case ActionTypes.CHANGE_CASE_NAME_FAIL:
            return Object.assign({},state,{isNameChangePending:false});
        case ActionTypes.REMOVE_CASE_DOCUMENTS_PENDING:
            return Object.assign({},state,{isRemoveDocumentsPending:true});
        case ActionTypes.REMOVE_CASE_DOCUMENTS_SUCCESS:
            return removeDocumentFromCase(state,action.hash);
        case ActionTypes.REMOVE_CASE_DOCUMENTS_FAIL:
            return Object.assign({},state,{isRemoveDocumentsPending:false});
        case ActionTypes.ADD_CASE_DOCUMENTS_PENDING:
            return Object.assign({},state,{isAddDocumentsPending: true});
        case ActionTypes.ADD_CASE_DOCUMENTS_SUCCESS:
            return Object.assign({},state,{isAddDocumentsPending: false, documents: addDocuments(state.documents, action.documents)});
        case ActionTypes.ADD_CASE_DOCUMENTS_FAIL:
            return Object.assign({},state,{isAddDocumentsPending: false});
        case ActionTypes.CASE_DOCUMENT_SELECT:
            return Object.assign({},state, {selectedDocumentIndex:action.index, objects: setSelectedAssignmentIndex(action.index,state.objects)});
        case ActionTypes.CASE_DOCUMENT_SELECT_BY_CASEID:
            return Object.assign({},state, {selectedDocumentIndex: state.documents.findIndex(doc => doc.hash == action.index)});
        case ActionTypes.OBJECT_ASSOCIATE_TERM:
            return modifyTermObjectAssociation(state, action, true);
        case ActionTypes.OBJECT_DISASSOCIATE_TERM:
            return modifyTermObjectAssociation(state, action, false);
        case ActionTypes.CREATE_OBJECT_PENDING:
            return Object.assign({},state,{isCreateObjectPending: true});
        case ActionTypes.CREATE_OBJECT_SUCCESS:
            return addObject(state, action);
        case ActionTypes.CREATE_OBJECT_FAIL:
            return Object.assign({},state,{isCreateObjectPending: false});
        case ActionTypes.DELETE_OBJECT_PENDING:
            return Object.assign({},state,{isDeleteObjectPending: true});
        case ActionTypes.DELETE_OBJECT_SUCCESS:
                return deleteObject(state, action.id);
        case ActionTypes.DELETE_OBJECT_FAIL:
            return Object.assign({},state,{isDeleteObjectPending: false});
        case ActionTypes.RENAME_OBJECT_PENDING:
            return Object.assign({},state,{isRenameObjectPending: true});
        case ActionTypes.RENAME_OBJECT_SUCCESS:
                return renameObject(state, action);
        case ActionTypes.RENAME_OBJECT_FAIL:
            return Object.assign({},state,{isRenameObjectPending: false});
        case ActionTypes.MARK_DOCUMENT_CASE_REVIEWED_PENDING:
            return Object.assign({},state,{isMarkDocumentReviewedPending:true});
        case ActionTypes.MARK_DOCUMENT_CASE_REVIEWED_SUCCESS:
            return Object.assign({},state,{isMarkDocumentReviewedPending:false, documents: markDocumentCaseReviewed(state.documents,action)});
        case ActionTypes.MARK_DOCUMENT_CASE_REVIEWED_FAIL:
            return Object.assign({},state,{isMarkDocumentReviewedPending:false});
        case ActionTypes.SHOW_DOCUMENT_PREVIEW_WINDOW:
            return Object.assign({}, state, {documentPreviewIndex: state.documents.findIndex(doc => doc.hash == action.hash), highlightedTermId: action.highlightedTermId});
        case ActionTypes.HIDE_DOCUMENT_PREVIEW_WINDOW:
            return Object.assign({}, state, {documentPreviewIndex: -1});
        case ActionTypes.UNHIGHLIGHT_TERM:
            return state.highlightedTermId == "" ? state : Object.assign({}, state, {highlightedTermId: ""});
        case ActionTypes.SELECTED_TERM:
            return Object.assign({}, state, {selectedTerm: action.id});
        case ActionTypes.SELECT_OBJECT:
            return selectObject(state, action);
        case ActionTypes.CASE_REORDER_DOCUMENTS_PENDING:
            return Object.assign({}, state, {isCaseReorderDocumentsPending: true});
        case ActionTypes.CASE_REORDER_DOCUMENTS_SUCCESS:
            return reorderDocuments(state, action.order);
        case ActionTypes.CASE_REORDER_DOCUMENTS_FAIL:
            return Object.assign({}, state, {isCaseReorderDocumentsPending: false});
        case ActionTypes.EDIT_TERM_MANUAL_END:
        case ActionTypes.EDIT_TERM_SELECTION_END:
            return state.selectedDocumentIndex > -1 ? editTerm(state,action) : state;
        case ActionTypes.ACCEPT_CASE_PENDING:
            return Object.assign({},state,{isAcceptPending:true});
        case ActionTypes.ACCEPT_CASE_SUCCESS:
            return Object.assign({}, state, {isAcceptPending: false});
        case ActionTypes.ACCEPT_CASE_FAIL:
            return Object.assign({}, state, {isAcceptPending: false});
        case ActionTypes.RESET_STATE:
            return action.name == 'case' ? INITIAL_STATE : state;
        case ActionTypes.ADD_COMMENTS_SUCCESS:
            return updateComments(state, action);
        case ActionTypes.SAVE_CASE_DOCUMENT_EDITS_PENDING:
            return Object.assign({},state,{isSaveEditsPending:true});
        case ActionTypes.SAVE_CASE_DOCUMENT_EDITS_SUCCESS:
            return saveCaseDocumentEditsSuccess(state, action);
        case ActionTypes.SAVE_CASE_DOCUMENT_EDITS_FAIL:
            return Object.assign({}, state, {isSaveEditsPending: false});
        case ActionTypes.GET_LOAN_EDITS_PENDING:
            return Object.assign({}, state, {isSaveLoanEditsPending: true});
        case ActionTypes.GET_LOAN_EDITS_SUCCESS:
            return saveLoanDetailsEditsSuccess(state, action);
        case ActionTypes.GET_LOAN_EDITS_FAIL:
            return Object.assign({}, state, {isSaveLoanEditsPending: false});
        case ActionTypes.UPDATE_OBJECT_TERM_ASSOCIATIONS_PENDING:
            return Object.assign({},state,{isSaveObjectAssociationsPending:true});
        case ActionTypes.UPDATE_OBJECT_TERM_ASSOCIATIONS_SUCCESS:
            return Object.assign({}, state, {isSaveObjectAssociationsPending: false, activeEdits: []});
        case ActionTypes.UPDATE_OBJECT_TERM_ASSOCIATIONS_FAIL:
            return Object.assign({}, state, {isSaveObjectAssociationsPending: false});
        case ActionTypes.SELECT_OBJECT_STATUS:
            return setObjectStatus(state, action.rowObject);
        case ActionTypes.GET_CASE_ACTION_SUCCESS:
            let caseActionItems = action.actionItems.map(i => {
                return {id: i.nextState, name: i.name};
            });
            return Object.assign({}, state, {caseActions: caseActionItems});
        case ActionTypes.SAVE_RECOMMENDATIONS_SUCCESS:
            return Object.assign({}, state, {SAVE_RECOMMENDATIONS_PENDING: false, activeEdits: []});
        default:
            return setStateViaExternalReducer(state,action);
    }
}

function setStateViaExternalReducer(state, action){

    let newState = state;

    //Pass action to documents
    if(state.selectedDocumentIndex >= 0){
        let currentDocument = state.documents[state.selectedDocumentIndex];
        let newDocumentState = DocumentReducer.default(currentDocument, action);
        if(currentDocument != newDocumentState){
            let newDocumentsState = newState.documents.slice();
            newDocumentsState[state.selectedDocumentIndex] = newDocumentState;
            newState = Object.assign({},state,{documents:newDocumentsState});
        }
    }

    //Pass action to objects
    newState = updateObjectComments(newState,action);
    
    return newState;
}

// this function is for adding objects to the activeEdits array in the TRID app so that exception recommendations can be saved
function setObjectStatus(state,object) {
    let newActiveEdits = state.activeEdits.slice();
    let newObjectsState = state.objects.slice();
    let findIndex = newObjectsState.findIndex(obj=>obj.id == object.id);
    newObjectsState[findIndex]=  Object.assign({},newObjectsState[findIndex],{status:object.status});

    let index = newActiveEdits.findIndex(x => x.id === object.id);

    if (index != -1) {
        // if incoming object matches any existing object in the array, this catches potential change in status
        newActiveEdits.splice(index,1,object);
    } else {
        // if incoming object does NOT match any object currently in array, simple add straight in
        newActiveEdits.push(object);
    }

    return Object.assign({}, state, {activeEdits: newActiveEdits, objects: newObjectsState});
}

/**
 * Merges successfully saved loan detail edits back to the redux store
 * @param state
 * @param edits
 * @returns {*}
 */
function saveLoanDetailsEditsSuccess(state, {edits}) {
    let newDocuments = [...state.documents];

    edits.forEach(({hash, edits}) => {
        let currentDocument = newDocuments.find(d => d.hash === hash);
        if (currentDocument) {
            // For each edit in the document
            edits.forEach(edit => {
                // Find the corresponding term
                currentDocument.terms.find(term => {
                    // Update the term's value and return
                    if (term.assignments && term.assignments.length && term.assignments[0].id === edit.id) {
                        // Push the new object as the first in the assignments array
                        term.assignments.unshift({
                            date: edit.editDate,
                            editor: edit.editor,
                            id: edit.id,
                            sourceId: hash,
                            term: {...edit.tag}
                        });

                        // Break the loop
                        return true;
                    }
                });
                const isEditHistoryExist = currentDocument.editHistory.find(history=>history.id==edit.id);
                if(isEditHistoryExist){
                    currentDocument.editHistory.find(history=>{
                        if(history.id==edit.id){
                            history.edits.push(edit);
                            return true;
                        }
                    })
                }else{
                    let history = Object.assign({},{edits:[edit],id:edit.id});
                    currentDocument.editHistory.push(history);
                }
            });
        }
    });

    return Object.assign({}, state, {documents: newDocuments, isSaveLoanEditsPending: false});
}

function saveCaseDocumentEditsSuccess(state, action){
    let newDocumentsState = state.documents.slice();
    let newActiveEditsState = state.activeEdits.slice();

    action.edits.forEach(edit => {
        let index = newDocumentsState.findIndex(document => document.hash == edit.hash);
        if (index > -1) {

            let newTerms = newDocumentsState[index].activeEdits.filter(e => e.id < 0);
            //Change document state. This includes assigning real ids to terms that are new
            newDocumentsState[index] = DocumentReducer.default(newDocumentsState[index], action);
            //Modify term associations at an object level, if applicable
            newTerms.forEach(t => {
               let updatedTerm = newDocumentsState[index].terms.find(m => m.originalId == t.id);
                updatedTerm.objectIds.forEach(objectId => {
                   let object = state.objects.find(o => o.id == objectId);
                   let objectTermIndex = object.terms.findIndex(x => x.name == t.tag.name);
                   object.terms = object.terms.slice();
                   object.terms[objectTermIndex].assignments = object.terms[objectTermIndex].assignments.slice();
                   let assignmentIndex = object.terms[objectTermIndex].assignments.findIndex(a => a.sourceId == newDocumentsState[index].hash && a.id == t.id);
                   object.terms[objectTermIndex].assignments[assignmentIndex] = Object.assign({},object.terms[objectTermIndex].assignments[assignmentIndex],{id: updatedTerm.id, term: updatedTerm});
               })
            });
        }

    });

    //Modify active edits that were associated with newly added terms (if necessary)
    newActiveEditsState.forEach(e => {
        if(e.adds){
            let isNewAddsCreated = false;
            e.adds.forEach((a, addIndex) => {
                if(a.id < 0){
                    //Find new id and replace
                    if(!isNewAddsCreated){
                        e.adds = e.adds.slice();
                        isNewAddsCreated = true;
                    }
                    e.adds[addIndex] = {hash: a.hash, id: newDocumentsState.find(d => d.hash == a.hash).terms.find(t => t.originalId == a.id).id};
                }
            })
        }
    });


    return Object.assign({}, state, {documents: newDocumentsState, isSaveEditsPending: false, activeEdits: newActiveEditsState});
}

function updateDocuments(state, action) {
    return updateCollectionViaExternalReducer(state,action,DocumentReducer,'documents');
}

function updateComments(state,action){
    return Object.assign({},state,updateObjectComments(updateDocuments(state,action),action));
}

function updateObjectComments(state,action){

    let newState = state;

    for(var x = 0; x < state.objects.length; x++){
        let object = newState.objects[x];
        let comments = CommentReducer.default(object.comments,action);
        if(comments != object.comments){
            let newObjectsState = newState.objects.slice();
            newObjectsState[x] = Object.assign({},object,{comments});
            newState = Object.assign({},newState,{objects: newObjectsState});
        }
    }

    return newState;
}

function updateCollectionViaExternalReducer(state, action, reducer, property){
    let newPropertyState = {}; //TODO, switch to computed property name when minimum support moves to Edge
    newPropertyState[property] = state[property].map(x => reducer.default(x, action));
    return Object.assign({},state,newPropertyState);
}

function selectObject(state, action) {
    const objects = Utilities.copy(state.objects);
    objects.forEach(o => {
        if (o.id === action.id) {
            o.isSelected = !o.isSelected;
        }
    });
    return Object.assign({}, state, {objects});
}

function addDocuments(currentList, addedDocuments){
    let newList = currentList.slice();
    newList.push(...addedDocuments);
    return newList;
}

function setCase(state, caseObject) {

    let caseState = {
        isFetching: false,
        id: caseObject.caseId,
        filteredAlerts: caseObject.filteredAlerts,
        name: caseObject.caseName,
        createdDate: caseObject.createdDate,
        status: caseObject.status,
        terms: caseObject.terms,
        objectTypes: _uniq(_flatten(caseObject.template.objects.map(o => o.objects.map(x => {
            return {id: x.id, name: x.name, template: Utilities.sortByNameAscending(x.terms, "termName")}
        }))), t => t.id),
        documents: caseObject.documents.map(d => {
            let template = caseObject.template.objects.find(o => o.id == d.templateId);
            d.template = (template == undefined ? [] : template);
            return DocumentReducer.default(DocumentReducer.INITIAL_STATE, {
                type: ActionTypes.GET_DOCUMENT_SUCCESS,
                documentWithMetadata: d,
                termSortOrder: 'category',
                areCategoriesCollapsedByDefault: false,
                isCaseDocument: true,
                caseTaskName: state.task.name

            });
        })
    };

    //TEMP: This will eventually be in the document reducer once we move to the new template
    caseState.documents.forEach(d => {
        let template = caseObject.template.objects.find(o => o.id == d.documentTypeTemplate.documentTypeID);
        if(template != undefined){
            d.terms.forEach(t => {
                template.objects.forEach(o => {
                    if(o.terms.find(x => x.termName == t.name)){
                        t.objectTypes.push(o.id);
                    }
                })
            })
        }
    });

    /* this section takes a specific set of mortgage document objects and puts them into
    the 'case.documents' array, so that we can get the document list sidebar functionality
    for mortgage cases as well. */
    const filteredLoanDocArray = caseObject.objects.filter(o => o.objectType === 'PROCESSED_LOAN_DOCUMENT' ||
    o.objectType === 'LOAN_DOCUMENT').map(o => {
        return Object.assign({}, o, {hash: o.id, fileName: o.name, syntheticDocument: true});
    });

    caseState.documents.push(...filteredLoanDocArray);

    caseObject.objects.forEach(o => {
        o.type = o.templateId; 
        delete o.templateId;
        o.comments = CommentReducer.default(CommentReducer.INITIAL_STATE,{
            type: ActionTypes.SET_COMMENTS,
            comments: o.comments,
            id: o.id
        });
    });
    
    
    caseState.objects = Utilities.sortByNameAscending(mergeObjectsAndTemplates(mergeObjectsAndTerms(caseObject.objects, caseState.documents), caseState.objectTypes));

    caseState.selectedDocumentIndex = caseState.documents.length > 0 ? 0 : -1;
    
    return Object.assign({}, state, caseState);
}

function mergeObjectsAndTemplates(objects,objectTypes){
    objects.forEach(o => {
        if (objectTypes.length > 0) {
            objectTypes.find(type => type.id == o.type).template.forEach(templateTerm => {
                if (o.terms.find(term => term.name == templateTerm.termName) == undefined) {
                    o.terms.push(objectTerm(templateTerm.termName));
                }
            });
        }
        o.terms = Utilities.sortByNameAscending(o.terms); //TODO: I think this can be reviewed because we will be getting terms in sorted order
    });
    return objects;
}

function objectTerm(termName){
    return {
        name: termName,
        assignments: [],
        selectedAssignmentIndex: -1
    }
}

function mergeObjectsAndTerms(objects, documents){
    objects.forEach(o =>
            o.terms.forEach(t => {

                    t.assignments.forEach(a => {
                        if(a.sourceId != o.id) {
                            a.sourceIndex = documents.findIndex(d => d.hash == a.sourceId);
                            a.sourceName = documents[a.sourceIndex].fileName;
                            a.term = documents[a.sourceIndex].terms.find(x => x.id == a.id);
                            a.term.objectIds.push(o.id);
                        }
                    });

                    t.selectedAssignmentIndex = t.assignments.length == 0 ? -1 : (t.assignments[0].sourceIndex == 0 ? 0 : -1);
                }
            )
    );
    return objects;
}

function setSelectedAssignmentIndex(selectedDocumentIndex, objects){
    let newObjectsState = Utilities.copy(objects);
    newObjectsState.forEach(o => o.terms.forEach(t => {
        if (t.assignments.length > 0) {
            t. selectedAssignmentIndex = getSelectedAssignmentIndex(t.assignments,selectedDocumentIndex); //returns -1 if not found
        }
    }));
    return newObjectsState;
}

function getSelectedAssignmentIndex(assignments,selectedDocumentIndex){
    return _findLastIndex(assignments,(a => a.sourceIndex <= selectedDocumentIndex));
}

function modifyTermObjectAssociation(state, action, isAdd){

    let {objectId, termId, sourceId} = action;
    let objectIndex = state.objects.findIndex(o => o.id == objectId);
    let newDocumentsState = state.documents.slice();
    let newObjectsState = state.objects.slice();
    let newActiveEditsState = state.activeEdits.slice();

    if(objectIndex != -1){
        let documentIndex = state.documents.findIndex(d => d.hash == sourceId);
        if(documentIndex != -1){

            newObjectsState[objectIndex] = Utilities.copy(newObjectsState[objectIndex]);
            let object = newObjectsState[objectIndex];
            let document = newDocumentsState[documentIndex];
            let documentTerm = document.terms.find(t => t.id == termId);
            if(documentTerm != undefined){
                let objectTerm = object.terms.find(t => t.name == documentTerm.name);

                if(objectTerm != undefined){

                    //Remove previous assignment of this term from this document
                    let objectEditsIndex = newActiveEditsState.findIndex(e => e.id == objectId);
                    if(objectEditsIndex != -1){
                        newActiveEditsState[objectEditsIndex] = Object.assign({},newActiveEditsState[objectEditsIndex]);
                    }
                    let objectEdits = (objectEditsIndex == -1 ? undefined : newActiveEditsState[objectEditsIndex]);
                    let previousAssignment = _remove(objectTerm.assignments, a => a.sourceId == document.hash);
                    let removedAdd = null;
                    let removedDelete = null;

                    if(previousAssignment.length > 0){
                        //check if this is in the list of adds, in which case we remove from active edits
                        removedAdd = pluckPreviousEdit(objectEdits, 'adds', objectEditsIndex, newActiveEditsState,sourceId,previousAssignment[0].id);
                        //If this object only had 1 edit and it was just removed, set objectEdits to undefined
                        if(removedAdd != null && newActiveEditsState.findIndex(a => a.id == objectId) == -1){
                            objectEdits = undefined;
                        }
                    }

                    //Modify document's term's objectIds array
                    newDocumentsState[documentIndex] = DocumentReducer.default(state.documents[documentIndex], action);

                    //Add to assignment array if this is an add
                    if(isAdd){
                        removedDelete = pluckPreviousEdit(objectEdits, 'deletes', objectEditsIndex,newActiveEditsState,sourceId, termId);
                        let newAssignment = {
                            id: termId,
                            sourceId: document.hash,
                            sourceName:document.fileName,
                            sourceIndex: documentIndex,
                            term: newDocumentsState[documentIndex].terms.find(t => t.id == termId)
                        };
                        objectTerm.assignments.splice(_sortedIndex(objectTerm.assignments,newAssignment,a => a.sourceIndex), 0, newAssignment);
                    }

                    //Recalculate selectedAssignmentIndex
                    objectTerm.selectedAssignmentIndex = getSelectedAssignmentIndex(objectTerm.assignments,state.selectedDocumentIndex);

                    //Update active edits state, but only if:
                    //This is an add and it does not cancel out a previous delete OR
                    //This is a delete and it does not cancel out a previous add
                    if( (isAdd && removedDelete == null) || (!isAdd && (removedAdd == null || removedAdd.id != termId))){
                        let editEntry = {hash: sourceId, id: termId};
                        let editProperty = isAdd ? 'adds' : 'deletes';
                        if(objectEdits == undefined){
                            objectEdits = {id: objectId};
                            newActiveEditsState.push(objectEdits);
                        }
                        objectEdits[editProperty] = (objectEdits[editProperty] == undefined ? [] : objectEdits[editProperty].slice());
                        objectEdits[editProperty].push(editEntry);
                    }

                    //In the case of an add, the previous assignment must be added to the list of deletes, unless the previous assignment
                    //was already in the edits as an add
                    if(isAdd && previousAssignment.length > 0 && removedAdd == null){
                        objectEdits.deletes = (objectEdits.deletes == undefined ? [] : objectEdits.deletes.slice());
                        objectEdits.deletes.push({hash: sourceId, id: previousAssignment[0].id});
                    }

                }
            }
        }
    }

    return Object.assign({},state,{objects:newObjectsState, documents: newDocumentsState, activeEdits: newActiveEditsState});
}

/**
 * Removes a previous edit from the active edits
 * @param objectEdits
 * @param objectEditsProperty 'adds' or 'deletes'
 * @param objectEditsIndex The index of the objectEdit in the objectEdits array
 * @param edits An array of objects with format {id, adds:[{hash, id}], deletes: [{hash, id}]}
 * @param sourceId The document hash
 * @param id The term id to look for
 */
function pluckPreviousEdit(objectEdits, objectEditsProperty, objectEditsIndex, edits, sourceId, id){
    let removed = [];
    if(objectEdits != undefined && objectEdits[objectEditsProperty]){
        objectEdits[objectEditsProperty] = objectEdits[objectEditsProperty].slice();
        removed = _remove(objectEdits[objectEditsProperty], a => a.hash == sourceId && a.id == id);
        if(objectEdits[objectEditsProperty].length == 0){
            delete objectEdits[objectEditsProperty];
            if(Object.getOwnPropertyNames(objectEdits).length == 1){ //only id property remains
                edits.splice(objectEditsIndex,1);
            }
        }
    }
    return removed.length > 0 ? removed[0] : null;
}

function removeDocumentFromCase(state, hash){

    let newObjectsState = state.objects;
    let newActiveEditsState = Utilities.copy(state.activeEdits);
    let hasObjectChanged = false;

    newObjectsState.forEach((o,objectIndex) => {
        let isObjectCopy = false;
        let assignmentDeletions = [];
        o.terms.forEach((t, termIndex) => {
               let assignmentIndex = t.assignments.findIndex(a => a.sourceId == hash);
               if(assignmentIndex != -1){
                   if(!isObjectCopy){
                       if(!hasObjectChanged){
                           newObjectsState = state.objects.slice();
                       }
                       newObjectsState[objectIndex] = Object.assign({},o);
                       newObjectsState[objectIndex].terms = newObjectsState[objectIndex].terms.slice();
                       isObjectCopy = true;
                       hasObjectChanged = true;
                   }
                   newObjectsState[objectIndex].terms[termIndex] = Object.assign({},newObjectsState[objectIndex].terms[termIndex]);
                   newObjectsState[objectIndex].terms[termIndex].assignments = newObjectsState[objectIndex].terms[termIndex].assignments.slice();
                   newObjectsState[objectIndex].terms[termIndex].assignments.splice(assignmentIndex);
               }
            }
        );
    });

    //Remove from any active edits
    if(newActiveEditsState.length > 0){
        let propertyNames = ['adds', 'deletes'];
        for(var index = newActiveEditsState.length - 1; index--; index >= 0){
            let edit = newActiveEditsState[index];
            propertyNames.forEach(property => {
                if(edit[property]){
                    edit[property] = edit[property].filter(a => a.sourceId != hash);
                    if(edit[property].length == 0){
                        delete edit[property];
                    }
                }
            });
            if(Object.getOwnPropertyNames(edit).length == 1){
                newActiveEditsState = newActiveEditsState.splice(index,1);
            }
        }
    }

    let removedDocumentIndex = state.documents.findIndex(x => x.hash == hash);
    let newDocumentsState = state.documents.slice();
    newDocumentsState.splice(removedDocumentIndex,1);

    let newSelectedDocumentIndex = -1;
    if(removedDocumentIndex == newDocumentsState.length){ //removed last document, go to previous
        if(newDocumentsState.length > 0){
            newSelectedDocumentIndex = removedDocumentIndex - 1;
        }else{
            newSelectedDocumentIndex = -1;
        }
    }else if(removedDocumentIndex == 0){ //removed first document, go to next
        if(newDocumentsState.length > 0){
            newSelectedDocumentIndex = 0;
        }else{
            newSelectedDocumentIndex = -1;
        }
    }else{ //removed a document between the first and last document in the case => move to next document
        newSelectedDocumentIndex = removedDocumentIndex;
    }

    setSelectedAssignmentIndex(newSelectedDocumentIndex,newObjectsState);

    return Object.assign({},state,{isRemoveDocumentsPending:false, objects: newObjectsState, activeEdits: newActiveEditsState, documents: newDocumentsState, selectedDocumentIndex: newSelectedDocumentIndex});
}

function computeObjectTerms(state, object) {
    let documents = state.documents.slice();
    let activeEdits = state.activeEdits.slice();
    var newAdds = [];
    object.terms.map (term => {
        for(var i=documents.length-1; i>=0; i--) {
            var docTerm = documents[i].terms.find(t => t.name==term.name);
            if(docTerm != undefined && docTerm.value != "" && documents[i].status!='Rejected') {
                newAdds.push({hash: documents[i].hash, id: docTerm.id});
                let newAssignment = {
                    id: docTerm.id,
                    sourceId: documents[i].hash,
                    sourceName:documents[i].fileName,
                    sourceIndex: i,
                    term: docTerm
                };
                term.selectedAssignmentIndex=0;
                term.assignments.push(newAssignment);
                documents[i] = DocumentReducer.default(documents[i],{
                    type: ActionTypes.OBJECT_ASSOCIATE_TERM,
                    objectId: object.id,
                    termId: docTerm.id
                });
                break;
            }
        }
    });
    activeEdits.push({id: object.id, adds: newAdds});
    return {newActiveEdits: activeEdits, newObject: object, newDocumentsState: documents}
}

function addObject(state, action){

    let newObjectsState = state.objects.slice();

    let {name,objectType,id} = action;

    let newObjectBeforeTermMapping = {
        name,
        type: objectType,
        id,
        terms: state.objectTypes.find(t => t.id == objectType).template.map(x => objectTerm(x.termName))
    };

    let result = computeObjectTerms(state, newObjectBeforeTermMapping);
    let {newObject, newActiveEdits, newDocumentsState} = result;
    newObjectsState.splice(_sortedIndex(newObjectsState,newObject,a => a.name), 0, newObject);
    return Object.assign({}, state, {isCreateObjectPending: false, documents: newDocumentsState, objects: setSelectedAssignmentIndex(state.selectedDocumentIndex, newObjectsState), activeEdits: newActiveEdits});
}

function deleteObject(state, objectId){

    let filteredObjects = state.objects.filter(o => {
        return o.id !== objectId;
    });

    //delete from active edits
    let newActiveEdits = state.activeEdits.filter(o => {
        return o.id !== objectId;
    });

    return Object.assign({}, state, {objects: filteredObjects,activeEdits: newActiveEdits,isDeleteObjectPending: false});
}

function renameObject(state, action){

    let newObjectsState = state.objects.slice();
    let objectIndex = state.objects.findIndex(o => o.id == action.objectId);

    if(objectIndex != -1){
        newObjectsState[objectIndex] = Object.assign({},newObjectsState[objectIndex],{name:action.name});
    }

    return Object.assign({}, state, {objects: newObjectsState, isRenameObjectPending: false});
}

function markDocumentCaseReviewed(documents, action){
    let {documentHash} = action;
    let newDocumentState = documents;
    let documentIndex = newDocumentState.findIndex(d => d.hash == documentHash);
    if(documentIndex != -1){
        newDocumentState = documents.slice();
        newDocumentState[documentIndex] = DocumentReducer.default(newDocumentState[documentIndex],action);
    }
    return newDocumentState;
}

function reorderDocuments(state,order){

    //1. Change order of documents
    let newDocumentsState = [];
    order.forEach(h => newDocumentsState.push(state.documents.find(x => x.hash == h)));

    //2. Change selectedDocumentIndex
    let newSelectedDocumentIndex = state.selectedDocumentIndex == -1 ? -1 : newDocumentsState.findIndex(x => x.hash == state.documents[state.selectedDocumentIndex].hash);

    //3. Change documentPreviewIndex
    let newDocumentPreviewIndex = state.documentPreviewIndex == -1 ? -1 :  newDocumentsState.findIndex(x => x.hash == state.documents[state.documentPreviewIndex].hash);

    //4. Change the object's assignments as the sourceIndex would have changed
    let newObjectsState = state.objects.map(o => {
        return Object.assign({},o,{terms:
            o.terms.map((t) => {
                let newAssignmentsState = t.assignments.map(a =>Object.assign({},a,{sourceIndex: newDocumentsState.findIndex(d => d.hash == a.sourceId)})).sort(a => a.sourceIndex);
                return(Object.assign({},t,{
                    assignments: newAssignmentsState,
                    selectedAssignmentIndex: getSelectedAssignmentIndex(newAssignmentsState,newSelectedDocumentIndex)
                }))
        })});
    });

    return Object.assign({},state,{
        documents: newDocumentsState,
        selectedDocumentIndex:newSelectedDocumentIndex,
        documentPreviewIndex:newDocumentPreviewIndex,
        objects: newObjectsState,
        isCaseReorderDocumentsPending:false
    });

}

function editTerm(state, action){
    let newState = setStateViaExternalReducer(state,action);
    let modifiedTerm = newState.documents[newState.selectedDocumentIndex].terms.find(t => t.id == action.id);

    if(modifiedTerm.objectIds.length > 0){
        //Go through object assignments and update term reference if necessary
        let newObjectsState = state.objects.slice();
        newObjectsState.filter(o => modifiedTerm.objectIds.includes(o.id)).forEach(o => {
            let termIndex = o.terms.findIndex(t => t.name == modifiedTerm.name);
            let newAssignmentsState = o.terms[termIndex].assignments.slice();
            let modifiedAssignmentIndex = newAssignmentsState.findIndex(a => a.id == action.id);
            newAssignmentsState[modifiedAssignmentIndex] = Object.assign({},newAssignmentsState[modifiedAssignmentIndex],{term:modifiedTerm});
            o.terms = o.terms.slice();
            o.terms[termIndex] = Object.assign({},o.terms[termIndex], {assignments: newAssignmentsState});
        });
        newState = Object.assign({},newState,{objects: newObjectsState})
    }

    return newState;
}