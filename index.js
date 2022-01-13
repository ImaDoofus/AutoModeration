ChatLib.chat('Automoderator bot')

const EntityArrow = Java.type('net.minecraft.entity.projectile.EntityArrow');

var pendingMessages = []
var lastSentTimestamp = 0;
function sendChatMessage() { // system to safely send at max 1 chat message a second.
    if (Date.now()-lastSentTimestamp > 1000) {
        if (pendingMessages.length > 0) {
            ChatLib.say(pendingMessages[0]);
            lastSentTimestamp = Date.now();
            pendingMessages.shift();    
        }
    }
}


var teamGriefers = {};
register('tick', () => {
    sendChatMessage()
    World.getAllEntitiesOfType(EntityArrow).forEach(arrow => { // loop through all arrows and get the shooter of the arrow.
        var shootingEntity = arrow.getEntity().field_70250_c;
        try {
            var shooter = new PlayerMP(shootingEntity)
            World.getAllPlayers().forEach(player => {
                if (player.getUUID().version() === 4) { // check if player and not NPC
                    if (player.getName() != shooter.getName()) { // you cant team grief you self
                        if ((player.getZ() > 15 && shooter.getZ() > 15) || (player.getZ() < 15 && shooter.getZ() < 15)) { // teams
                            // "raycast" the arrow to see if it would hit the player
                            velX = arrow.getX()-arrow.getLastX();
                            velY = arrow.getY()-arrow.getLastY();
                            velZ = arrow.getZ()-arrow.getLastZ();
                            distThreshold = 0.7;
                            quality = 10;
                            for (var k = 0; k < quality; k++) {
                                distX = player.getX()-arrow.getX()-((k/quality)*velX);
                                distY = player.getY()+2-arrow.getY()-((k/quality)*velY);
                                distZ = player.getZ()-arrow.getZ()-((k/quality)*velZ);
                                if (-distThreshold < distX  && distX < distThreshold) {
                                    if (0 < distY && distY < distThreshold*2.2) {
                                        if (-distThreshold < distZ && distZ < distThreshold) {
                                            if (shooter.getName() in teamGriefers) {
                                                if (Date.now()-teamGriefers[shooter.getName()].lastWarningMessage > 2000) {
                                                    pendingMessages.push(`/pc ${shooter.getName()} is team griefing and hit ${player.getName()}`);
                                                    teamGriefers[shooter.getName()].offences++;
                                                    teamGriefers[shooter.getName()].lastWarningMessage = Date.now();
                                                }
                                                if (teamGriefers[shooter.getName()].offences >= 3) {
                                                    pendingMessages.push(`/tp ${shooter.getName()} -12.5 97 -34.5`);
                                                    teamGriefers[shooter.getName()].offences = 0;
                                                }
                                            } else {
                                                teamGriefers[shooter.getName()] = { lastWarningMessage: Date.now(), offences: 1 };
                                                pendingMessages.push(`/pc ${shooter.getName()} is team griefing and hit ${player.getName()}`);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        } catch (e) {
            console.log('could not create player object')
        }
    });
});


