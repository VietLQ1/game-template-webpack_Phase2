import InputHandler from "../input/InputHandler";
import GeoDashScene from "../scenes/GeoDashScene";

class Player extends Phaser.GameObjects.Sprite implements GeoDash.IObserver {
    public speedX: number;
    private _jumping: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.setTint(0x00ff00); // Set player color
        // Enable physics on this object
        scene.physics.add.existing(this);
        scene.physics.world.enable(this);
        // Set player properties
        this.speedX = 392; // Adjust as needed for game speed

        // Initialize jump key
        if (scene.input.keyboard == null)
            throw new Error("scene.input.keyboard is null");
        console.log(scene.input.keyboard);
        if (scene instanceof GeoDashScene) {
            scene.inputHandler.attach(this);
        }
        let body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(57, 57 ); 
    }
    public onNotify(subject: GeoDash.ISubject): void {
        //console.log("Player notified");
        if (subject instanceof InputHandler) {
            //console.log("InputHandler instance");
            if (subject.jumpKey.isDown || subject.pointer.isDown) {
                this._jumping = true;
            }
            else {
                this._jumping = false;
            }
        }
    }
    public update(): void {
        let body = this.body as Phaser.Physics.Arcade.Body;
        // console.log(body.blocked.up);
        body.setVelocityX(this.speedX); // Move right at constant speed
        this.jump();
    }
    private jump(): void {
        let body = this.body as Phaser.Physics.Arcade.Body;
        // Jump if the space key is pressed and the player is touching the ground
        if (this._jumping && body.blocked.down){
            body.setVelocityY(-910); // Adjust jump strength as needed
            body.setAngularVelocity(300); // Add some spin to the jump
            body.setAllowRotation(true); // Allow the player to rotate in the air
        }
        else if (!body.blocked.down) {
            body.setAngularVelocity(300); 
            body.setAllowRotation(true); // Allow the player to rotate in the air
        }
        else if (body.blocked.down) {
            body.setAngularVelocity(0); // Stop spinning when touching the ground
            body.setAllowRotation(false); // Don't allow the player to rotate on the ground
            this.flatOut();
        }
    }
    private flatOut(): void {
        if (this.angle < 45 && this.angle > -45) {
            this.angle = 0;
        }
        else if (this.angle >= 45 && this.angle < 135) {
            this.angle = 90;
        }
        else if (this.angle <= -45 && this.angle > -135) {
            this.angle = -90;
        }
        else if (this.angle >= 135 || this.angle <= -135) {
            this.angle = 180;
        }
    }
    public setActive(value: boolean): this {
        super.setActive(value);
        if (value && this.scene instanceof GeoDashScene) {
            this.scene.inputHandler.attach(this);
        }
        else if (!value && this.scene instanceof GeoDashScene) {
            this.scene.inputHandler.detach(this);
            this._jumping = false;
        }
        return this;
    }
}
export default Player;