function createElementWithClass(tagName, className) {
    const element = document.createElement(tagName)
    element.className = className
    return element
}


function Obstacle(reverseOrder = false) {
    this.element = createElementWithClass('div', 'obstacle')

    const border = createElementWithClass('div', 'border-obstacle')
    const body = createElementWithClass('div', 'body-obstacle')
    
    this.element.appendChild(reverseOrder ? body : border)
    this.element.appendChild(reverseOrder ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}

// const obs = new Obstacle(true)
// obs.setHeight(300)
// document.querySelector('[wm-flappy]').appendChild(obs.element)

function PairOfObstacle(height, opening, x) {
    this.element = createElementWithClass('div', 'pair-of-obstacle')

    this.top = new Obstacle(true)
    this.bottom = new Obstacle(false)

    this.element.appendChild(this.top.element)
    this.element.appendChild(this.bottom.element)
    
    this.giveOpening = () => {
        const lengthTop = Math.random() * (height - opening)
        const lengthBottom = height - opening - lengthTop
        this.top.setHeight(lengthTop)
        this.bottom.setHeight(lengthBottom)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    
    this.getWidth = () => this.element.clientWidth

    this.giveOpening()
    this.setX(x)
}


// const obs = new PairOfObstacle(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(obs.element)

function Obstacles(heigth, width, opening, distance, addScore) {
    this.pairs = [
        new PairOfObstacle(heigth, opening, width),
        new PairOfObstacle(heigth, opening, width + distance),
        new PairOfObstacle(heigth, opening, width + distance * 2),
        new PairOfObstacle(heigth, opening, width + distance * 3)
    ]

    const movement = 3

    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - movement)
            
            // when the obstacle leave the game area
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + distance * this.pairs.length)
                pair.giveOpening()
            }
            
            const half = width / 2
            const halved = pair.getX() + movement >= half && pair.getX() < half
            console.log(`half=${half} | halved=${halved}`)
            if (halved) 
                addScore()
        })
    }
}


function Bird(heightGame) {
    let flying = false

    this.element = createElementWithClass('img', 'bird')
    this.element.src = 'src/imgs/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = event => flying = true
    window.onkeyup = event => flying = false

    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = heightGame - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        } 
    }

    this.setY(heightGame / 2)
}


function Progress() {
    this.element = createElementWithClass('span', 'progress')
    this.updateScore = score => {
        this.element.innerHTML = score
    }

    this.updateScore(0)
}


function isSuperposed(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = (a.left + a.width >= b.left) && (b.left + b.width >= a.left)
    const vertical = (a.top + a.height >= b.top) && (b.top + b.height >= a.top)

    return horizontal && vertical
}


function crashed(bird, obstacles) {
    let crashed = false

    obstacles.pairs.forEach(pairOfObstacle => {
        if(!crashed) {
            const top = pairOfObstacle.top.element
            const bottom = pairOfObstacle.bottom.element

            crashed = isSuperposed(bird.element, top) || isSuperposed(bird.element, bottom)
        }
    })

    return crashed
}

function FlappyBird() {
    let score = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const obstacles = new Obstacles(height, width, 200, 400, 
        () => progress.updateScore(++score))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    obstacles.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            obstacles.animate()
            bird.animate()
            if (crashed(bird, obstacles)) {
                clearInterval(timer)
            }
        }, 20);
    }
}


new FlappyBird().start()
// const barreiras = new Obstacles(700, 1200, 200, 400)
// const passaro = new Bird(700)

// const areaDoJogo = document.querySelector('[wm-flappy]')
// areaDoJogo.appendChild(passaro.element)
// areaDoJogo.appendChild(new Progress().element)
// barreiras.pairs.forEach(pair => areaDoJogo.appendChild(pair.element))

// setInterval(() => {
//     barreiras.animate()
//     passaro.animate()
// }, 20);