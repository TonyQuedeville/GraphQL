/*class GraphPoint {
    constructor(title, titleAxeX, titleAxeY, width, height){
        this.title = title
        this.titleAxeX = titleAxeX
        this.titleAxeY = titleAxeY
        this.width = width
        this.height = height
    }
}

class Courbe extends GraphPoint{
    constructor(xValue, yValue){
        super(title, titleAxeX, titleAxeY, width, height)
        this.xValue = xValue // datas.length
        this.yValue = yValue // .amount .cumul
        this.hoverLegend = this.titleAxeX 
    }
}
//*/

/* Création d'un graphique */
function createChart(chartName, titre, width = 60, height = 40){
    document.getElementById("chart" + chartName).remove()
    const chartContainer = document.createElement("div")
    chartContainer.id = "chart" + chartName
    chartContainer.style.width = width + 'vw'
    chartContainer.style.height = height + 'vh'
    chartContainer.className = "graphique"
    document.getElementById("infoUser").appendChild(chartContainer)
    // si div Carré
    if(width == "height") chartContainer.style.width = chartContainer.getBoundingClientRect().height + "px"

    const title = document.createElement("p")
    title.textContent = titre
    title.id = "title" + chartName
    title.classList = "title center"
    chartContainer.append(title)
}

/* Graphique de points */
function createGraphPoint(chartName, datas, cumul, titleAxeX, titleAxeY){
    let valinit
    switch(cumul){
        case "cumul":
            valinit = datas[0].cumul
            break
            
        default :
            valinit = datas[0].amount
    }

    // Caractéristiques
    const container = document.getElementById("chart" + chartName)
    const marge = 6 // (padding: 5px + border 1px) : _layout.sass
    const sizeTitle = document.getElementById("titleProgressXp").getBoundingClientRect().height

    // Taille des points
    const sizeCircle = 12
    const sizePt = 2

    // Espace de legendes
    legendX = container.getBoundingClientRect().width / 30
    legendY = container.getBoundingClientRect().height / 4 

    // Dimensions du graphique
    const width = container.getBoundingClientRect().width - legendX - marge*2 
    const height = container.getBoundingClientRect().height - legendY - marge*2 - sizeTitle
    //console.log(width, ":", height)
    
    // Création de l'élément SVG
    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("width", container.getBoundingClientRect().width - marge*2)
    svg.setAttribute("height", container.getBoundingClientRect().height - sizeTitle*2 - marge*2 - sizePt)
    svg.classList = "grille"

    // Axes
    const groupAxes = document.createElementNS(svgNS, "g")
    groupAxes.id = "groupAxes"
    const axes = document.createElementNS(svgNS, "polyline")
    const gauche = valinit + sizePt + legendX - marge
    const droite = width + marge*2 + sizePt 
    const haut = marge - sizePt
    const bas = height - valinit + marge - sizePt + 40
    const coordAxes = gauche + "," + haut + " " + 
                    gauche + "," + bas + " " + 
                    droite + "," + bas + " " 
    axes.setAttribute("points", coordAxes)
    axes.setAttribute("fill", "none")
    axes.setAttribute("stroke", "grey")
    groupAxes.appendChild(axes)
    svg.appendChild(groupAxes)
    
    // Titre Axe X
    const axeTitleX = document.createElementNS(svgNS, "text")
    axeTitleX.setAttribute("x", droite / 2)
    axeTitleX.setAttribute("y", bas + marge*2)
    axeTitleX.setAttribute("fill", "white")
    axeTitleX.setAttribute("font-size", "12px")
    axeTitleX.setAttribute("text-anchor", "start")
        const spanTitleX = document.createElementNS(svgNS, "tspan")
        spanTitleX.setAttribute("alignment-baseline", "middle")
        spanTitleX.innerHTML = titleAxeX
        axeTitleX.appendChild(spanTitleX)
    svg.appendChild(axeTitleX)

    // Titre Axe Y
    const axeTitleY = document.createElementNS(svgNS, "text")
    axeTitleY.setAttribute("x", -bas/2 - marge*2)
    axeTitleY.setAttribute("y", legendX - marge*2)
    axeTitleY.setAttribute("fill", "white")
    axeTitleY.setAttribute("font-size", "12px")
    axeTitleY.setAttribute("text-anchor", "start")
    axeTitleY.setAttribute("transform", "rotate(-90)")
        const spanTitleY = document.createElementNS(svgNS, "tspan")
        spanTitleY.setAttribute("alignment-baseline", "start")
        spanTitleY.innerHTML = titleAxeY
        axeTitleY.appendChild(spanTitleY)
    svg.appendChild(axeTitleY)

    // Graduations
    for(let i = 0; i < 10; i++){
        const graduationY = document.createElementNS(svgNS, "line")
        graduationY.setAttribute("x1", gauche)
        graduationY.setAttribute("x2", droite)
        graduationY.setAttribute("y1", ((bas - haut) / 10) * i) 
        graduationY.setAttribute("y2", ((bas - haut) / 10) * i)
        graduationY.setAttribute("stroke", "white")
        graduationY.setAttribute("opacity", ".05")
        svg.appendChild(graduationY)
    }

    for(let i = 1; i <= 10; i++){
        const graduationX = document.createElementNS(svgNS, "line")
        graduationX.setAttribute("x1", gauche + i*(droite - gauche)/10)
        graduationX.setAttribute("x2", gauche + i*(droite - gauche)/10)
        graduationX.setAttribute("y1", haut - marge) 
        graduationX.setAttribute("y2", bas)
        graduationX.setAttribute("stroke", "white")
        graduationX.setAttribute("opacity", ".05")
        svg.appendChild(graduationX)
    }
    
    // Courbe 
    createCourbe(1, datas, "cumul", svg, svgNS, width, height, sizePt, sizeCircle)
    createCourbe(2, datas, "amount", svg, svgNS, width, height, sizePt, sizeCircle)

    // Ajout de l'élément SVG au DOM
    container.appendChild(svg)
}

/* Ajout d'une Courbe dans le graphique */
function createCourbe(id, datas, typeY, svg, svgNS, width, height, sizePt, sizeCircle){
    let maxi = 0
        for (let i = 0; i < datas.length; i++) {
            maxi = Math.max(maxi, datas[i].cumul)
        }        

        let coefx = (width - legendX/2 - sizePt) / datas.length 
        let coefy = maxi / (height - sizePt * 2) 

        // Courbe Id
        const courbe = document.createElementNS(svgNS, "g")
        courbe.id = "courbe_" + id

        // Lignes
        const groupLignes = document.createElementNS(svgNS, "g")
        groupLignes.id = "groupLignes_" + id

        // Points
        const groupPoints = document.createElementNS(svgNS, "g")
        groupPoints.id = "groupPoints_" + id
        let coordPath = "M"

        datas.forEach((data,i) => { 
            let valueY
            switch(typeY){
                case "cumul":
                    valueY = data.cumul
                    break
                default:
                    valueY = data.amount
            } 

            const groupPoint = document.createElementNS(svgNS, "g")
            groupPoint.classList = "groupPoint"  

            const pt = document.createElementNS(svgNS, "circle")
            const circle = document.createElementNS(svgNS, "circle")
            const cx = i * coefx + sizePt + legendX
            const cy = height - valueY / coefy + 40

            pt.setAttribute("cx", cx)
            pt.setAttribute("cy", cy)
            pt.setAttribute("r", sizePt)
            pt.setAttribute("filter", "drop-shadow(3px 3px 2px rgba(0,0,0,.7))")
            pt.setAttribute("fill", "yellow")
            pt.classList = "hoverCircle"

            circle.setAttribute("cx", cx)
            circle.setAttribute("cy", cy)
            circle.setAttribute("r", sizeCircle/2)
            circle.setAttribute("fill", "white")
            circle.setAttribute("opacity", "0")
            circle.classList = "hoverCircle"
            
            if(i == 0){
                coordPath = coordPath + cx + "," + cy
            } else {
                coordPath = coordPath + "L" + cx + "," + cy
            }
            groupPoint.appendChild(circle) 
            groupPoint.appendChild(pt) // "Mx,yLx,yL..."

            const hoverObjetName = document.createElementNS(svgNS, "text")
            hoverObjetName.innerHTML = data.object.name
            hoverObjetName.classList = "hoverValue"
            hoverObjetName.setAttribute("x", 90)
            hoverObjetName.setAttribute("y", 30)
            hoverObjetName.setAttribute("fill", "white")
            hoverObjetName.setAttribute("opacity", "0")
            hoverObjetName.setAttribute("font-size", "12px")
            hoverObjetName.setAttribute("text-anchor", "start")
            hoverObjetName.setAttribute("animate", "start")
            groupPoint.append(hoverObjetName)

            const hoverXp = document.createElementNS(svgNS, "text")
            hoverXp.innerHTML = data.amount + " kB"
            hoverXp.classList = "hoverValue"
            hoverXp.setAttribute("x", 90)
            hoverXp.setAttribute("y", 48)
            hoverXp.setAttribute("fill", "white")
            hoverXp.setAttribute("opacity", "0")
            hoverXp.setAttribute("font-size", "12px")
            hoverXp.setAttribute("text-anchor", "start")
            groupPoint.append(hoverXp)

            const hoverDateProject = document.createElementNS(svgNS, "text")
            hoverDateProject.innerHTML =  data.createdAt.substring(0, 10);
            hoverDateProject.classList = "hoverValue"
            hoverDateProject.setAttribute("x", 90)
            hoverDateProject.setAttribute("y", 66)
            hoverDateProject.setAttribute("fill", "white")
            hoverDateProject.setAttribute("opacity", "0")
            hoverDateProject.setAttribute("font-size", "12px")
            hoverDateProject.setAttribute("text-anchor", "start")
            groupPoint.append(hoverDateProject)

            const hoverValue = document.createElementNS(svgNS, "text")
            hoverValue.innerHTML = valueY + " kB"
            hoverValue.classList = "hoverValue"
            hoverValue.setAttribute("x", cx - 1)
            hoverValue.setAttribute("y", cy - 24)
            hoverValue.setAttribute("fill", "yellow")
            hoverValue.setAttribute("opacity", "0")
            if(i == datas.length-1){
                hoverValue.setAttribute("fill", "yellow")
                hoverValue.setAttribute("opacity", "1")
                hoverValue.setAttribute("y", cy + 24)
            }
            hoverValue.setAttribute("font-size", "12px")
            hoverValue.setAttribute("text-anchor", "middle")
            groupPoint.append(hoverValue)

            groupPoints.appendChild(groupPoint)
        })
        
        if(typeY == "cumul"){
            const path = document.createElementNS(svgNS, "path")
            path.setAttribute("d", coordPath)
            path.setAttribute("stroke", "white")
            path.setAttribute("fill", "none")
            groupLignes.appendChild(path)
        }

        courbe.appendChild(groupLignes)
        courbe.appendChild(groupPoints)
        svg.appendChild(courbe)
}


// ----------------------------------------------------------------------------------------------------------------



/* graphique de barres */
function createGraphBar(chartName, datas){
    let maxi = 0
    for (const key in datas) {
        maxi = Math.max(maxi, datas[key].cumul)
    }

    const firstKey = Object.keys(datas)[0]
    const nbData = Object.keys(datas).length;

    const container = document.getElementById("chart" + chartName)
    const marge = 6 // (padding: 5px + border 1px) : _layout.sass
    const sizeTitle = document.getElementById("titleSkill").getBoundingClientRect().height

    // Espace de legendes
    legendX = marge //container.getBoundingClientRect().width / 70
    legendY = container.getBoundingClientRect().height / 4 

    // Dimensions du graphique
    const width = container.getBoundingClientRect().width - legendX - marge*2 
    const height = container.getBoundingClientRect().height - legendY - marge*2 - sizeTitle
    
    let coefx = width / nbData
    let coefy = maxi / height
    // Dimension des barres du graphique
    const barWidth = coefx / 1.12
    const barPadding = coefx / 10
    // centrage des barres au milieu du graph
    let x = (width - (barWidth + barPadding) * nbData + barPadding) / 2

    // Création de l'élément SVG
    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("width", container.getBoundingClientRect().width - marge*2)
    svg.setAttribute("height", container.getBoundingClientRect().height - marge*2 - sizeTitle)
    svg.classList = "grille"

    for (const keyData in datas) {
        const data = datas[keyData]

        const styleForme = document.createElementNS(svgNS, "rect")
        styleForme.setAttribute("x", x + legendX )
        styleForme.setAttribute("y", height - data.cumul/coefy + 20)
        styleForme.setAttribute("width", barWidth)
        styleForme.setAttribute("height", data.cumul/coefy)
        styleForme.setAttribute("fill", "yellow")
        svg.appendChild(styleForme)

        const hoverObjetCumul = document.createElementNS(svgNS, "text")
        hoverObjetCumul.innerHTML = data.cumul + " %"
        hoverObjetCumul.classList = "hoverValue"
        hoverObjetCumul.setAttribute("x", x + barWidth/2 + legendX)
        hoverObjetCumul.setAttribute("y", height - data.cumul/coefy + 15)
        hoverObjetCumul.setAttribute("fill", "white")
        hoverObjetCumul.setAttribute("opacity", "1")
        hoverObjetCumul.setAttribute("font-size", "12px")
        hoverObjetCumul.setAttribute("text-anchor", "middle")
        hoverObjetCumul.setAttribute("animate", "start")
        svg.appendChild(hoverObjetCumul)

        const hoverObjetName = document.createElementNS(svgNS, "text")
        hoverObjetName.innerHTML = keyData.split("_")[1]
        hoverObjetName.classList = "hoverValue"
        hoverObjetName.setAttribute("x", x + barWidth/2 + legendX)
        hoverObjetName.setAttribute("y", height + legendY/3)
        hoverObjetName.setAttribute("fill", "white")
        hoverObjetName.setAttribute("opacity", "1")
        hoverObjetName.setAttribute("font-size", "14px")
        hoverObjetName.setAttribute("text-anchor", "end")
        hoverObjetName.setAttribute("transform", "rotate(-60)")
        hoverObjetName.style.transformOrigin = "100% center"
        hoverObjetName.style.transformBox = "fill-box"
        svg.appendChild(hoverObjetName)

        x += barWidth + barPadding
    }

    container.appendChild(svg)
}

/* --------------------------------------------------------------------------------------------------------- */


/* graphique Level */
function createGraphLevel(chartName, datas){
    const levelMax = 50
    const level = datas["level"].amount

    const container = document.getElementById("chart" + chartName)
    const marge = 6 // (padding: 5px + border 1px) : _layout.sass
    const sizeTitle = document.getElementById("titleLevel").getBoundingClientRect().height
    const cercleCentral = 50

    // Création de l'élément SVG
    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("width", container.getBoundingClientRect().width - marge*2)
    svg.setAttribute("height", container.getBoundingClientRect().height - marge*2)
    const width = container.getBoundingClientRect().width - marge*2
    const height = container.getBoundingClientRect().width - marge*2
    //svg.classList = "grille"

    // Elements en cercle
    var radius = height / 3 // rayon de la spirale
    var angle = -1.39 // angle initial
    var centerX = width / 2 // position X du centre du svg
    var centerY = height / 2 - sizeTitle // position Y du centre du svg
    var sizeCircle = 3

    const circleLevelSvg = document.createElementNS(svgNS, "circle")
    circleLevelSvg.setAttribute("cx", centerX)
    circleLevelSvg.setAttribute("cy", centerY)
    circleLevelSvg.setAttribute("r", cercleCentral)
    circleLevelSvg.setAttribute("stroke", "white")
    circleLevelSvg.setAttribute("fill", "black")
    circleLevelSvg.setAttribute("filter", "drop-shadow(5px 5px 5px rgba(0,0,0,1))")
    circleLevelSvg.setAttribute("opacity", ".2")
    circleLevelSvg.setAttribute("font-size", "54px")
    circleLevelSvg.setAttribute("text-anchor", "middle")
    svg.appendChild(circleLevelSvg)

    const levelSvg = document.createElementNS(svgNS, "text")
    levelSvg.innerHTML = level
    levelSvg.setAttribute("x", centerX)
    levelSvg.setAttribute("y", centerY + 18)
    levelSvg.setAttribute("fill", "white")
    levelSvg.setAttribute("filter", "drop-shadow(5px 5px 5px rgba(0,0,0,1))")
    levelSvg.setAttribute("opacity", "1")
    levelSvg.setAttribute("font-size", "54px")
    levelSvg.setAttribute("text-anchor", "middle")
    svg.appendChild(levelSvg)
    
    for (var i = 1; i <= levelMax; i++) {
        var cx = centerX + radius * Math.cos(angle)
        var cy = centerY + radius * Math.sin(angle)

        const circle = document.createElementNS(svgNS, "circle")
        circle.setAttribute("cx", cx)
        circle.setAttribute("cy", cy)
        circle.setAttribute("r", sizeCircle)
        circle.setAttribute("filter", "drop-shadow(3px 3px 2px rgba(0,0,0,.7))")
        circle.setAttribute("fill", "white")
        circle.setAttribute("opacity", i/level)
        if(i<= level) circle.setAttribute("fill", "yellow")
        
        if (i <= level){
            const segment = document.createElementNS(svgNS, "line")
            segment.setAttribute("x1", cx)
            segment.setAttribute("x2", centerX + cercleCentral * Math.cos(angle))
            segment.setAttribute("y1", cy) 
            segment.setAttribute("y2", centerY + cercleCentral * Math.sin(angle))
            segment.setAttribute("stroke", "white")
            segment.setAttribute("stroke-width", "2")
            segment.setAttribute("opacity", i/level/3)
            if (i == level){
                segment.setAttribute("stroke", "yellow")
                segment.setAttribute("opacity", "1")
            }
            svg.appendChild(segment)
        }
        
        svg.appendChild(circle)
        
        angle += Math.PI / 26 // 5 éléments par tour demi tour
    }

    container.appendChild(svg)
}