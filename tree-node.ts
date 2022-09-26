
namespace ulib {

    export interface ITreeNode<T> {
        Id: string,
        Counter: number, // unique number
        Item: T,
        Items: ITreeNode<T>[],
        Nav: ITreeNodeNav<T>,
    }

    export interface ITreeNodeNav<T> {
        Parent?: ITreeNode<T>,
        FirstChild?: ITreeNode<T>,
        LastChild?: ITreeNode<T>,
        Next?: ITreeNode<T>,
        Prev?: ITreeNode<T>
    }

    export class TreeNode<T> {

        static IdCounter = -1;
        private root: ITreeNode<T> = null;

        constructor() {
            console.log('tree node started..');
            this.root = this.createNode(null);
        }

        public add(dstItemId: string, value: T): ITreeNode<T> {

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

        private addNodeTo(node: ITreeNode<T>, newNode: ITreeNode<T>) {

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

        private getRouteId(node: ITreeNode<T>): string {
            let newId: string = node.Counter.toString();

            if (node.Nav.Parent.Nav.Parent == undefined) {
                return `n${newId}`;
            }
            else {
                return `${node.Nav.Parent.Id}-${newId}`;
            }
        }

        // the format is: n1-7-25, the root is not included and the last element is the target id
        private findNode(id: string): ITreeNode<T> {
            return this.findNodeRoutes(this.root, id);
        }

        public find(id: string): ITreeNode<T> {
            return this.findNodeRoutes(this.root, id);
        }

        public findIn(idContainer: string, idToFind: string): ITreeNode<T> {
            let node = this.findNodeRoutes(this.root, idContainer);
            if (node == null) { throw `Error findingIn: could not find node with id:${idContainer}`; }
            return this.findNodeRoutes(node, idToFind);
        }

        private findNodeRoutes(root: ITreeNode<T>, id: string): ITreeNode<T> {
            if (id == null) { return root; }
            let remainingRoutes = id.substring(1).split('-').map(s => parseInt(s));
            let currentRouteId = remainingRoutes[0];
            let currentNode = root.Nav.FirstChild;
            if (currentNode == undefined) { return null; }
            do {
                if (currentNode.Counter == currentRouteId) {
                    remainingRoutes.shift();
                    if (remainingRoutes.length == 0) { return currentNode; }
                    currentRouteId = remainingRoutes[0];
                    currentNode = currentNode.Nav.FirstChild;
                }
                else {
                    currentNode = currentNode.Nav.Next;
                }
            }
            while (currentNode != undefined)
            return null;
        }

        public getSiblingsOf(id: string): ITreeNode<T>[] {
            let TreeNode = this.find(id);
            let parent = TreeNode.Nav.Parent;
            let siblings: ITreeNode<T>[] = [];
            this.iterateChildren(parent, (node) => {
                if (node.Id != id) {
                    siblings.push(node);
                }
            }, false);
            return siblings;
        }

        public iterateAll(fn: (current: ITreeNode<T>) => void, deep: boolean = true) {
            this.iterate(this.root, fn, deep);
        }

        public iterateFirstLevel(fn: (current: ITreeNode<T>) => void) {
            this.iterateChildren(this.root, fn);
        }

        public iterateChildren(currentNode: ITreeNode<T>, fn: (current: ITreeNode<T>) => void, deep: boolean = true) {
            if (currentNode == undefined) return;
            if (currentNode.Nav.FirstChild == undefined) return;
            fn(currentNode.Nav.FirstChild);
            this.iterate(currentNode.Nav.FirstChild, fn, deep);
        }

        public getChildrenOf(node: ITreeNode<T>, deep:boolean=true): ITreeNode<T>[] {
            let nodes: ITreeNode<T>[] = [];
            this.iterateChildren(node, p => nodes.push(p), deep);
            return nodes;
        }

        public getFirstLevel(): ITreeNode<T>[] {
            let nodes: ITreeNode<T>[] = [];
            this.iterateChildren(this.root, p => nodes.push(p), false);
            return nodes;
        }

        // only private class usage
        private iterate(currentNode, fn: (current: ITreeNode<T>) => void, deep: boolean = true) {
            if (currentNode == undefined) return;

            if (currentNode.Nav.FirstChild != undefined && deep) {
                fn(currentNode.Nav.FirstChild);
                let children = this.iterate(currentNode.Nav.FirstChild, fn, deep);
                if (children != null) { return children; }
            }
            if (currentNode.Nav.Next != undefined) {
                fn(currentNode.Nav.Next);
                let sibling = this.iterate(currentNode.Nav.Next, fn, deep);
                if (sibling != null) { return sibling; }

            }
        }

        // deprecated
        private findNodeRecursive(currentNode: ITreeNode<T>, id: string): ITreeNode<T> {
            if (currentNode.Id == id) { return currentNode; }
            if (currentNode.Nav.FirstChild != undefined) {
                let children = this.findNodeRecursive(currentNode.Nav.FirstChild, id);
                if (children != null) { return children; }
            }
            if (currentNode.Nav.Next != undefined) {
                let sibling = this.findNodeRecursive(currentNode.Nav.Next, id);
                if (sibling != null) { return sibling; }

            }
            return null;
        }

        public cut(idRoute: string): ITreeNode<T> {
            let node = this.findNode(idRoute);

            if (node == null) {
                throw `Error cuting: could not find node with id:${idRoute}`;
            }
            else {
                return this.cutNode(node);
            }
        }

        private cutNode(node: ITreeNode<T>): ITreeNode<T> {
            if (node == undefined) return null;
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

        public delete(id: string) {
            let node = this.findNode(id);

            if (node == null) {
                throw `Error deleting: could not find node with id:${id}`;
            }
            else {
                this.deleteNode(node);
            }
        }

        private deleteNode(node: ITreeNode<T>) {
            if (node == undefined) return null;
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
            let objectsToDelete: ITreeNode<T>[] = [];
            this.iterateChildren(node, n => {
                objectsToDelete.push(n);
            });

            for (var i = 0; i < objectsToDelete.length; i++) {
                this.destroy(objectsToDelete[i]);
            }
            this.destroy(node);
        }

        private destroy(node: ITreeNode<T>) {
            node.Id = null;
            node.Items = null;
            if (node.Nav.FirstChild != undefined) { delete node.Nav.FirstChild; }
            if (node.Nav.LastChild != undefined) { delete node.Nav.LastChild; }
            if (node.Nav.Next != undefined) { delete node.Nav.Next; }
            if (node.Nav.Parent != undefined) { delete node.Nav.Parent; }
            if (node.Nav.Prev != undefined) { delete node.Nav.Prev; }
            node.Nav = null;
            node.Item = null;
        }

        public paste(dstId: string, nodeToPaste: ITreeNode<T>) {
            let node: ITreeNode<T>;
            if (dstId == null) { node = this.root; }
            else { node = this.findNode(dstId); }
            if (node == null) {
                throw `Error pasting: could not find node with id:${dstId}`;
            }
            this.addNodeTo(node, nodeToPaste);
        }

        public clone(idRoute: string): ITreeNode<T> {
            let node: ITreeNode<T>;
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

        private getRootId(): string {
            return this.root.Id;
        }

        public getRoot() {
            return this.root;
        }

        private createNode(Item): ITreeNode<T> {
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

}