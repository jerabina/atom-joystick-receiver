function led2 () {
    if (enableLed == 1) {
        if (robotnum == 1) {
            robotAtom.rgb().showColor(neopixel.colors(NeoPixelColors.Red))
        } else if (robotnum == 2) {
            robotAtom.rgb().showColor(neopixel.colors(NeoPixelColors.Blue))
        }
    } else {
        robotAtom.rgb().showColor(neopixel.colors(NeoPixelColors.Black))
    }
}
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
radio.onReceivedValue(function (name, value) {
    if (name == "X") {
        x = Math.map(value, 5, 1023, -255, 255)
    }
    if (name == "Y") {
        y = Math.map(value, 5, 1023, -255, 255)
    }
    if (name == "F" && value == 1) {
        if (robotnum == 1) {
            music.ringTone(440)
        } else {
            music.ringTone(349)
        }
    } else if (name == "F" && value == 0) {
        music.stopAllSounds()
    }
    if (name == "E" && value == 1) {
        if (enableLed == 1) {
            enableLed = 0
            led2()
        } else {
            enableLed = 1
            led2()
        }
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
let enableLed = 0
let fPivYLimit = 0
let COMPUTERANGE = 0
let robotnum = 0
robotnum = 1
serial.redirectToUSB()
COMPUTERANGE = 256
fPivYLimit = 32
let deadZone = 20
enableLed = 1
radio.setGroup(robotnum)
basic.showNumber(robotnum)
robotAtom.MotorRunAtomStyle(0, 0)
basic.forever(function () {
    computeMotors(x, y)
})
