// import { EventEmitter } from '@pky/fe-utils'
// import { useRef, useState } from 'react'
// import styles from './index.module.scss'
// export default function Demo() {
//   const eventRef = useRef(new EventEmitter())
//   const [inputValue, setInputValue] = useState('')
//   const [checkbox, setCheckbox] = useState(['red', 'blue'])
//   const [boxs, setBoxs] = useState([
//     {
//       key: 'red',
//       isSub: false,
//     },
//     {
//       key: 'blue',
//       isSub: false,
//     },
//   ])
//   const [redContent, setRedContent] = useState('')
//   const [blueContent, setBlueContent] = useState('')
//   const updateContentRef = useRef(function updateContent(
//     key: string,
//     content: string
//   ) {
//     if (key === 'red') {
//       setRedContent(content)
//     } else if (key === 'blue') {
//       setBlueContent(content)
//     }
//   })
//   const handleCheckboxChange = (key: string, isCheck: boolean) => {
//     if (isCheck) {
//       setCheckbox([...checkbox, key])
//     } else {
//       const temp = [...checkbox]
//       const index = temp.findIndex((item) => item === key)
//       temp.splice(index, 1)
//       setCheckbox(temp)
//     }
//   }
//   const handlePub = () => {
//     checkbox.forEach((type) => {
//       eventRef.current.emit(type, type, inputValue)
//     })
//   }
//   const handleSub = (key) => {
//     let isSub // 是否订阅
//     const newBoxs = boxs.reduce((result, item) => {
//       const obj = { ...item }
//       if (obj.key === key) {
//         obj.isSub = !obj.isSub
//         isSub = obj.isSub
//       }
//       result.push(obj)
//       return result
//     }, [])
//     setBoxs(newBoxs)
//     if (isSub) {
//       eventRef.current.on(key, updateContentRef.current)
//     } else {
//       eventRef.current.off(key, updateContentRef.current)
//     }
//   }
//   return (
//     <div className={styles.demo}>
//       <div>
//         <input
//           style={{ marginRight: 10 }}
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//         />
//         <input
//           type="checkbox"
//           checked={checkbox.includes('red')}
//           onChange={(e) => handleCheckboxChange('red', e.target.checked)}
//         />
//         <span style={{ color: 'red' }}>红色</span>
//         <input
//           type="checkbox"
//           checked={checkbox.includes('blue')}
//           onChange={(e) => handleCheckboxChange('blue', e.target.checked)}
//         />
//         <span style={{ color: 'blue' }}>蓝色</span>
//         <button style={{ marginLeft: 10 }} onClick={handlePub}>
//           发布
//         </button>
//       </div>
//       <div className={styles.content}>
//         {boxs.map((box) => {
//           return (
//             <div key={box.key}>
//               <div>{box.key === 'red' ? redContent : blueContent}</div>
//               <button onClick={() => handleSub(box.key)}>
//                 {box.isSub && '取消'}订阅
//               </button>
//               {/* <button>只订阅一次</button> */}
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }
import React from 'react'

export default function Temporary() {
  return <div>TODO</div>
}
