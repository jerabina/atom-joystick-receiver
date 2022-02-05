// Calculate final mix of Drive and Pivot
// m_leftMotor  = (1.0 - fPivScale) * nMotPremixL + fPivScale * ( nPivSpeed);
// /m_rightMotor = (1.0 - fPivScale) * nMotPremixR + fPivScale * (-nPivSpeed);
// Motor (left)  premixed output        (-127..+127)
// Motor (right) premixed output        (-127..+127)
// Pivot Speed                          (-127..+127)
// Balance scale b/w drive and pivot    (   0..1   )
function computeMotors (XValue: number, YValue: number) {
    // Balance scale b/w drive and pivot    (   0..1   )
    // Calculate Drive Turn output due to Joystick X input
    if (YValue >= 0) {
        if (XValue >= 0) {
            nMotPremixL = COMPUTERANGE
        } else {
            nMotPremixL = COMPUTERANGE + XValue
        }
        if (XValue >= 0) {
            nMotPremixR = COMPUTERANGE - XValue
        } else {
            nMotPremixR = COMPUTERANGE
        }
    } else {
        if (XValue >= 0) {
            nMotPremixL = COMPUTERANGE - XValue
        } else {
            nMotPremixL = COMPUTERANGE
        }
        if (XValue >= 0) {
            nMotPremixR = COMPUTERANGE
        } else {
            nMotPremixR = COMPUTERANGE + XValue
        }
    }
    // Scale Drive output due to Joystick Y input (throttle)
    nMotPremixL = nMotPremixL * YValue / COMPUTERANGE
    nMotPremixR = nMotPremixR * YValue / COMPUTERANGE
    // Now calculate pivot amount
    // - Strength of pivot (nPivSpeed) based on Joystick X input
    // - Blending of pivot vs drive (fPivScale) based on Joystick Y input
    nPivSpeed = XValue
    if (Math.abs(YValue) > fPivYLimit) {
        fPivScale = 0
    } else {
        fPivScale = 1 - Math.abs(YValue) / fPivYLimit
    }
    leftMotor = (1 - fPivScale) * nMotPremixL + fPivScale * nPivSpeed
    rightMotor = (1 - fPivScale) * nMotPremixR + fPivScale * (0 - nPivSpeed)
    robotAtom.MotorRunAtomStyle(rightMotor, leftMotor)
}
input.onButtonPressed(Button.A, function () {
    robotAtom.MotorStopAll()
    serial.writeValue("btnA", VL53L0X.readSingleDistance())
})
function avoid () {
    if (VL53L0X.readSingleDistance() > 100) {
        robotAtom.MotorRunDual(robotAtom.Motors.M1A, 150, robotAtom.Motors.M2B, 150)
    } else {
        robotAtom.MotorRunDual(robotAtom.Motors.M1A, -100, robotAtom.Motors.M2B, -100)
        basic.pause(100)
        robotAtom.MotorRunDual(robotAtom.Motors.M1A, 0, robotAtom.Motors.M2B, -150)
        basic.pause(100)
    }
}
radio.onReceivedValue(function (name, value) {
    if (name == "X") {
        x = Math.map(value, 5, 1023, -255, 255)
    }
    if (name == "Y") {
        y = Math.map(value, 5, 1023, -255, 255)
    }
    if (name == "E" && value == 1) {
        mode = mode + 1
        if (mode > 1) {
            mode = 0
        }
        music.playTone(523, music.beat(BeatFraction.Sixteenth))
        basic.showString("" + (mode))
    }
})
let y = 0
let x = 0
let rightMotor = 0
let leftMotor = 0
let fPivScale = 0
let nPivSpeed = 0
let nMotPremixR = 0
let nMotPremixL = 0
let fPivYLimit = 0
let COMPUTERANGE = 0
let mode = 0
basic.showIcon(IconNames.Heart)
VL53L0X.init()
serial.redirectToUSB()
mode = 0
COMPUTERANGE = 256
fPivYLimit = 32
let deadZone = 20
radio.setGroup(1)
robotAtom.MotorRunAtomStyle(0, 0)
basic.forever(function () {
    if (mode == 0) {
        computeMotors(x, y)
    } else if (mode == 1) {
        avoid()
    }
})
