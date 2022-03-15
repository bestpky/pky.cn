import Image from 'next/image'
import React, { useEffect, useRef } from 'react'

import Animate from '@lib/utils/bezier-animate'

import styles from './index.module.scss'

export default function LikePro() {
  const animateIns = useRef<InstanceType<typeof Animate>>()
  const bezierBox = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bezierBox.current) {
      animateIns.current = new Animate({
        box: bezierBox.current,
      })
    }
  }, [])

  return (
    <div className="max-w-3xl container flex-center">
      <div className={styles.box} ref={bezierBox}>
        <Image
          onClick={() => {
            if (!animateIns.current?.isPlaying) {
              const cb = (div) => {
                div.style.backgroundImage = `url(/like-thumb.png)`
                div.style.backgroundSize = 'cover'
              }
              animateIns.current?.create(cb)
              // animateIns.current?.batchCreate(cb)
            }
          }}
          src={'/like-thumb.png'}
          alt=""
          width="30"
          height={30}
        />
      </div>
    </div>
  )
}
