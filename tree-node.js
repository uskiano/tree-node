var ulib;
(function (ulib) {
    class TreeNode {
        constructor() {
            this.root = null;
            console.log('tree node started..');
            this.root = this.createNode(null);
        }
        add(dstItemId, value) {
            let node = this.findNode(dstItemId);
            if (node == null) {
                throw `Error adding: could not find node with id:${dstItemId}`;
            }
            else {
                let newNode = this.createNode(value);
                this.addNodeTo(node, newNode);
                return newNode;
            }
        }
        addNodeTo(node, newNode) {
            newNode.Nav.Parent = node;
            let lastChild = node.Nav.LastChild;
            if (lastChild == undefined) {
                node.Items = new Array(0);
                node.Nav.FirstChild = newNode;
                node.Nav.LastChild = newNode;
            }
            else {
                newNode.Nav.Prev = lastChild;
                lastChild.Nav.Next = newNode;
                node.Nav.LastChild = newNode;
            }
            node.Items.push(newNode);
            newNode.Id = this.getRouteId(newNode);
        }
        getRouteId(node) {
            let newId = node.Counter.toString();
            if (node.Nav.Parent.Nav.Parent == undefined) {
                return `n${newId}`;
            }
            else {
                return `${node.Nav.Parent.Id}-${newId}`;
            }
        }
        // the format is: n1-7-25, the root is not included and the last element is the target id
        findNode(id) {
            return this.findNodeRoutes(this.root, id);
        }
        find(id) {
            return this.findNodeRoutes(this.root, id);
        }
        findIn(idContainer, idToFind) {
            let node = this.findNodeRoutes(this.root, idContainer);
            if (node == null) {
                throw `Error findingIn: could not find node with id:${idContainer}`;
            }
            return this.findNodeRoutes(node, idToFind);
        }
        findNodeRoutes(root, id) {
            if (id == null) {
                return root;
            }
            let remainingRoutes = id.substring(1).split('-').map(s => parseInt(s));
            let currentRouteId = remainingRoutes[0];
            let currentNode = root.Nav.FirstChild;
            if (currentNode == undefined) {
                return null;
            }
            do {
                if (currentNode.Counter == currentRouteId) {
                    remainingRoutes.shift();
                    if (remainingRoutes.length == 0) {
                        return currentNode;
                    }
                    currentRouteId = remainingRoutes[0];
                    currentNode = currentNode.Nav.FirstChild;
                }
                else {
                    currentNode = currentNode.Nav.Next;
                }
            } while (currentNode != undefined);
            return null;
        }
        getSiblingsOf(id) {
            let TreeNode = this.find(id);
            let parent = TreeNode.Nav.Parent;
            let siblings = [];
            this.iterateChildren(parent, (node) => {
                if (node.Id != id) {
                    siblings.push(node);
                }
            }, false);
            return siblings;
        }
        iterateAll(fn, deep = true) {
            this.iterate(this.root, fn, deep);
        }
        iterateFirstLevel(fn) {
            this.iterateChildren(this.root, fn);
        }
        iterateChildren(currentNode, fn, deep = true) {
            if (currentNode == undefined)
                return;
            if (currentNode.Nav.FirstChild == undefined)
                return;
            fn(currentNode.Nav.FirstChild);
            this.iterate(currentNode.Nav.FirstChild, fn, deep);
        }
        getChildrenOf(node, deep = true) {
            let nodes = [];
            this.iterateChildren(node, p => nodes.push(p), deep);
            return nodes;
        }
        getFirstLevel() {
            let nodes = [];
            this.iterateChildren(this.root, p => nodes.push(p), false);
            return nodes;
        }
        // only private class usage
        iterate(currentNode, fn, deep = true) {
            if (currentNode == undefined)
                return;
            if (currentNode.Nav.FirstChild != undefined && deep) {
                fn(currentNode.Nav.FirstChild);
                let children = this.iterate(currentNode.Nav.FirstChild, fn, deep);
                if (children != null) {
                    return children;
                }
            }
            if (currentNode.Nav.Next != undefined) {
                fn(currentNode.Nav.Next);
                let sibling = this.iterate(currentNode.Nav.Next, fn, deep);
                if (sibling != null) {
                    return sibling;
                }
            }
        }
        // deprecated
        findNodeRecursive(currentNode, id) {
            if (currentNode.Id == id) {
                return currentNode;
            }
            if (currentNode.Nav.FirstChild != undefined) {
                let children = this.findNodeRecursive(currentNode.Nav.FirstChild, id);
                if (children != null) {
                    return children;
                }
            }
            if (currentNode.Nav.Next != undefined) {
                let sibling = this.findNodeRecursive(currentNode.Nav.Next, id);
                if (sibling != null) {
                    return sibling;
                }
            }
            return null;
        }
        cut(idRoute) {
            let node = this.findNode(idRoute);
            if (node == null) {
                throw `Error cuting: could not find node with id:${idRoute}`;
            }
            else {
                return this.cutNode(node);
            }
        }
        cutNode(node) {
            if (node == undefined)
                return null;
            let next = node.Nav.Next;
            let prev = node.Nav.Prev;
            if (prev != undefined) {
                prev.Nav.Next = next;
            }
            if (next != undefined) {
                next.Nav.Prev = prev;
            }
            let parent = node.Nav.Parent;
            if (parent.Nav.FirstChild.Id == node.Id) {
                parent.Nav.FirstChild = node.Nav.Next;
            }
            if (parent.Nav.LastChild.Id == node.Id) {
                parent.Nav.LastChild = node.Nav.Prev;
            }
            return node;
        }
        delete(id) {
            let node = this.findNode(id);
            if (node == null) {
                throw `Error deleting: could not find node with id:${id}`;
            }
            else {
                this.deleteNode(node);
            }
        }
        deleteNode(node) {
            if (node == undefined)
                return null;
            let next = node.Nav.Next;
            let prev = node.Nav.Prev;
            if (prev != undefined) {
                delete prev.Nav.Next;
                prev.Nav.Next = next;
            }
            if (next != undefined) {
                delete next.Nav.Prev;
                next.Nav.Prev = prev;
            }
            let parent = node.Nav.Parent;
            if (parent.Nav.FirstChild.Id == node.Id) {
                delete parent.Nav.FirstChild;
                parent.Nav.FirstChild = node.Nav.Next;
            }
            if (parent.Nav.LastChild.Id == node.Id) {
                delete parent.Nav.LastChild;
                parent.Nav.LastChild = node.Nav.Prev;
            }
            let objectsToDelete = [];
            this.iterateChildren(node, n => {
                objectsToDelete.push(n);
            });
            for (var i = 0; i < objectsToDelete.length; i++) {
                this.destroy(objectsToDelete[i]);
            }
            this.destroy(node);
        }
        destroy(node) {
            node.Id = null;
            node.Items = null;
            if (node.Nav.FirstChild != undefined) {
                delete node.Nav.FirstChild;
            }
            if (node.Nav.LastChild != undefined) {
                delete node.Nav.LastChild;
            }
            if (node.Nav.Next != undefined) {
                delete node.Nav.Next;
            }
            if (node.Nav.Parent != undefined) {
                delete node.Nav.Parent;
            }
            if (node.Nav.Prev != undefined) {
                delete node.Nav.Prev;
            }
            node.Nav = null;
            node.Item = null;
        }
        paste(dstId, nodeToPaste) {
            let node;
            if (dstId == null) {
                node = this.root;
            }
            else {
                node = this.findNode(dstId);
            }
            if (node == null) {
                throw `Error pasting: could not find node with id:${dstId}`;
            }
            this.addNodeTo(node, nodeToPaste);
        }
        clone(idRoute) {
            let node;
            if (idRoute == null) {
                node = this.root;
            }
            else {
                node = this.findNode(idRoute);
                if (node == null) {
                    throw `Error cloning: could not find node with id:${idRoute}`;
                }
            }
            let mapTable = {}; // correlate original ids with copied ids
            let newRoot = this.createNode(null);
            let newValue = JSON.parse(JSON.stringify(node.Item));
            let head = this.createNode(newValue);
            this.addNodeTo(newRoot, head);
            head.Id = this.getRouteId(head);
            mapTable[node.Id] = head.Id;
            this.iterateChildren(node, childNode => {
                let valueCopy = JSON.parse(JSON.stringify(childNode.Item));
                let nodeCopy = this.createNode(valueCopy);
                let originalParentIdRoute = childNode.Nav.Parent.Id;
                let copyParentIdRoute = mapTable[originalParentIdRoute];
                let copyParentNode = this.findNodeRoutes(newRoot, copyParentIdRoute);
                this.addNodeTo(copyParentNode, nodeCopy);
                nodeCopy.Id = this.getRouteId(nodeCopy);
                mapTable[childNode.Id] = nodeCopy.Id;
            });
            // detach newRoot and destroy
            delete head.Nav.Parent;
            this.destroy(newRoot);
            return head;
        }
        getRootId() {
            return this.root.Id;
        }
        getRoot() {
            return this.root;
        }
        createNode(Item) {
            let consecutive = ++TreeNode.IdCounter;
            return {
                Id: 'n' + consecutive,
                Counter: consecutive,
                Items: null,
                Nav: {},
                Item: Item
            };
        }
    }
    TreeNode.IdCounter = -1;
    ulib.TreeNode = TreeNode;
})(ulib || (ulib = {}));
