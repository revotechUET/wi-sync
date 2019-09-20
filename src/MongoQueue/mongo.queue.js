//init connection

// const mongoose = require('mongoose');
const Node = require('./mongo.model');

class MongoQueue {
    constructor(NodeModel) {
        //init head and tail
        this.Node = NodeModel;
        this.head = null;
        this.tail = null;
    }

    initLoad() {
        return new Promise((resolve, reject)=>{
            // find head
            this.Node.findOne({isHead: true}, (err, headRs)=>{
                if (err) {
                    reject(err);
                }
                if (headRs) {
                    this.head = headRs;
                    if (headRs.isTail) {
                        this.tail = headRs;
                        resolve(null);
                    } else {
                        this.Node.findOne({isTail: true}, (err, tailRs)=>{
                            if (err) {
                                reject(err);
                            } else {
                                if (tailRs) {
                                    this.tail = tailRs;
                                    resolve(null);
                                } else {
                                    reject({message: 'Error. Lost tail. Delete mongo db'});
                                }
                            }
                        });
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }

    enqueue(value) {
        return new Promise((resolve, reject)=>{
            let node = new this.Node({
                value: value
            });
            if (this.head) {
                node.next = this.head._id;
                node.save((err, nodeRs) => { 
                    if (err) {
                        reject(err);
                    } else {
                        this.head.isHead = false;
                        this.head.previous = nodeRs._id;
                        this.head.save((err) => {
                            if (err) {
                                reject(err);
                            } else {
                                this.head = node;
                                resolve(null);
                            }
                        });
                    }
                });
            } else {
                node.isTail = true;
                node.previous = node._id;
                node.save((err)=>{
                    if (err) {
                        reject(err);
                    } else {
                        this.head = node;
                        this.tail = node;
                        resolve(null);
                    }
                });
            }
        });
    }

    dequeue() {
        if (this.tail == null) {
            return null;
        } else {
            return this.tail.value;
        }
    }

    deleteTail() {
        return new Promise((resolve, reject)=>{
            if (this.tail) {
                if (this.tail._id.toString() === this.head._id.toString()) {
                    this.head = null;
                    this.Node.findByIdAndDelete(this.tail._id, (err)=>{
                        if (err) {
                            reject(err);
                        } else {
                            this.tail = null;
                            resolve(null);
                        }
                    });
                }
                else if (this.tail.previous.toString() === this.head._id.toString()) {
                    this.Node.findByIdAndDelete(this.tail._id,(err)=>{
                        if (err) {
                            reject(err);
                        } else {
                            this.tail = this.head;
                            this.tail.previous = this.tail._id;
                            this.head.isTail = true;
                            this.head.next = null;
                            this.tail.isHead = true;
                            this.tail.next = null;
                            resolve(null);
                        }
                    });
                } else {
                    this.Node.findById(this.tail.previous, (err, rs)=>{
                        if (err) {
                            reject(err);
                        } else {
                            if (rs) {
                                rs.isTail = true;
                                rs.next = null;
                                rs.save((err, newTail)=>{
                                    if (err) {
                                        reject(err);
                                    } else {
                                        this.Node.findByIdAndDelete(this.tail._id, (err)=>{
                                            if (err) {
                                                reject(err);
                                            } else {
                                                this.tail = newTail;
                                                resolve(null);
                                            }
                                        });
                                    }
                                })
                            }
                        }
                    });
                }
            } else {
                reject({message: 'Nothing to delete'});
            }
        });
    }
}


module.exports = MongoQueue;




