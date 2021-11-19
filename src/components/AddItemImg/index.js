// react hook
import { useState, useEffect, useRef } from "react"
// react-image-crop libraries
import ReactCrop from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faImage } from "@fortawesome/free-solid-svg-icons"
import { useLayoutEffect } from "react"
import ReactDom from "react-dom"
import styles from "./AddItemImg.module.scss"

// ---------------------------- Crop popup ----------------------------
function useLockBodyScroll() {
  useLayoutEffect(() => {
    document.body.style.overflow = "hidden"
    return () => (document.body.style.overflow = "visible")
  }, [])
}

function CropImgPopup({
  upImg,
  crop,
  setCrop,
  completedCrop,
  setCompletedCrop,
  setFinalCrop,
  imgRef,
  onCancelCrop,
  onSave,
}) {
  // Call hook to lock body scroll
  useLockBodyScroll()

  const initCropSize = (img) => {
    imgRef.current = img
    let max = img.width < img.height ? img.width : img.height // Get max width, height px (Base on minium value between width and height)
    setCrop({
      unit: "px",
      width: max,
      height: max,
      aspect: 1 / 1,
    })
    setCompletedCrop({
      unit: "px",
      width: max,
      height: max,
      aspect: 1,
      x: 0,
      y: 0,
    })
    return false // Return false when setting crop state in here.
  }

  return ReactDom.createPortal(
    <>
      <div className={styles.container}>
        <ReactCrop
          className="cropSection"
          src={upImg}
          crop={crop}
          onChange={(c) => setCrop(c)}
          onImageLoaded={initCropSize}
          onComplete={(c) => {
            setCompletedCrop(c)
          }}
        />
        <div className="menuSection">
          <button
            className="save"
            onClick={() => {
              onSave(completedCrop)
            }}
          >
            Save
          </button>
          <button className="cancel" onClick={onCancelCrop}>
            Cancel
          </button>
        </div>
      </div>
    </>,
    document.getElementById("modal-root")
  )
}

// ----------------------------------------------------------------------

export default function AddItemImg({ handleFileSync, size, index }) {
  const upImgStyle = size === "lg" ? styles.canvasLg : styles.canvasSm
  const [isPopup, setIsPopup] = useState(false)
  const [upImg, setUpImg] = useState()
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState(null)
  const [finalCrop, setFinalCrop] = useState()
  const [filename, setFilename] = useState("")
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!finalCrop || !canvasRef.current || !imgRef.current) {
      return
    }

    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = finalCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext("2d")
    const pixelRatio = window.devicePixelRatio

    canvas.width = crop.width * pixelRatio * scaleX
    canvas.height = crop.height * pixelRatio * scaleY

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )

    canvas.toBlob(
      (blob) => {
        blob.name = filename
        handleFileSync(blob, index)
      },
      "image/jpeg",
      1
    )
  }, [finalCrop])

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener("load", () => setUpImg(reader.result))
      setFilename(file.name)
      setIsPopup(true)
    }
  }

  const handleCancelCrop = () => {
    setIsPopup(false)
    setFilename("")
  }

  const handleConfirmCrop = (crop) => {
    setIsPopup(false)
    setFinalCrop(crop)
  }

  return (
    <>
      {finalCrop ? (
        <div>
          <canvas ref={canvasRef} className={upImgStyle}></canvas>
        </div>
      ) : (
        <>
          <div>
            <input
              type="file"
              onChange={onSelectFile}
              accept="image/png, image/jpeg"
              id={index}
              name="myImage"
            />
            <label htmlFor={index}>
              <FontAwesomeIcon icon={faImage} size="2x" color="#8B8EA1" />
              Add image
            </label>
          </div>
          {isPopup ? (
            <CropImgPopup
              upImg={upImg}
              crop={crop}
              setCrop={setCrop}
              completedCrop={completedCrop}
              setCompletedCrop={setCompletedCrop}
              setFinalCrop={setFinalCrop}
              imgRef={imgRef}
              onCancelCrop={handleCancelCrop}
              onSave={handleConfirmCrop}
            />
          ) : null}
        </>
      )}
    </>
  )
}