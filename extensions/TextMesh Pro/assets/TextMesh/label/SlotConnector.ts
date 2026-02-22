
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('SlotConnector')
export class SlotConnector extends Component {
    @property(Node)
    public labelNode: Node = null;
}
