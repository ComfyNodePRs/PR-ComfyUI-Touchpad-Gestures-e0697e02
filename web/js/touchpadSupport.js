/** @type { import("../../../../web/scripts/app.js") } */
import { app } from '../../../scripts/app.js'
const { LGraphCanvas } = window

const isTouchpad = e => e.wheelDelta ? !!(e.wheelDelta % 120) : e.deltaMode === 0
const isTouchpadZooming = e => e.ctrlKey && !!(e.deltaY % 100)
const canTargetScroll = e => e.target.clientHeight < e.target.scrollHeight
// const isTouchpad = e => e.wheelDeltaX || e.wheelDeltaY ? Math.abs(e.wheelDeltaX) !== 120 && Math.abs(e.wheelDeltaY) !== 120 : e.deltaMode === 0

const oldProcessMouseWheel = LGraphCanvas.prototype.processMouseWheel;

// Options
const scrollZooming = true
const touchpadZooming = false
const zoomSpeed = 0.2
const touchpadZoomSpeed = 1
const allowPanningOverNonScrollableTextareas = true
const allowZoomingOverTextareas = false

let isPanning = false

const enablePanning = () => isPanning = true
const disablePanning = () => (isPanning = false, document.removeEventListener("pointermove", disablePanning))

const processMouseWheel = e => {
  // console.log("target", e.target)
  // console.log("panning", isPanning)
  const scale = app.canvas.ds.scale
  const touchpad = isTouchpad(e)
  const touchpadZooming = isTouchpadZooming(e)
  const deltaZoom =  100 / (touchpadZooming ? touchpadZoomSpeed : zoomSpeed) / scale

  if (e.target.tagName === "TEXTAREA") {
    const targetCanScroll = canTargetScroll(e)
    if (allowPanningOverNonScrollableTextareas && !targetCanScroll) enablePanning()
    // if (!touchpad && !e.ctrlKey && !allowZoomingOverTextareas) return e.preventDefault(), false
  }

  // console.log("zoom",touchpadZooming, deltaZoom, touchpad, touchpad ? touchpadZoomSpeed : zoomSpeed, e)
  if (app.canvas.graph && app.canvas.allow_dragcanvas && isPanning) {
    document.addEventListener("pointermove", disablePanning);

    let { deltaX, deltaY } = e
    if (e.shiftKey) deltaX = e.deltaY, deltaY = e.deltaX

    if (e.metaKey || e.ctrlKey || (scrollZooming && !touchpad) || (touchpadZooming && touchpad)) {
      if (e.metaKey) deltaZoom *= -1 / 0.5
      app.canvas.ds.changeScale(scale - e.deltaY / deltaZoom, [e.clientX, e.clientY])
      app.canvas.graph.change()
    } else app.canvas.ds.mouseDrag(-deltaX, -deltaY)
    
    app.canvas.graph.change()
    e.preventDefault()
    return false
  } else {
    oldProcessMouseWheel.bind(app.canvas, e)
    if (e.ctrlKey) e.preventDefault()
    return true
  }
}

app.canvasEl.parentElement.addEventListener("mousewheel", processMouseWheel)

LGraphCanvas.prototype.processMouseWheel = e => enablePanning()