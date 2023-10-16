import { musicFile } from '@main/types'
import { useMusicStore } from '@renderer/store'
import { playListItem } from '@renderer/types/default'
import { storeToRefs } from 'pinia'

export const useMusicService = () => {
    const musicstore = useMusicStore()
    const { musicPlayList, musicVoice } = storeToRefs(musicstore)
    let listItem: playListItem

    const playListAdd = async () => {
        musicstore.addPlayList(await window.api.file.loadPathFile())
    }
    /**
     * 获取当前音频长度
     * @param val -- 传入进来的参数
     */
    const seek = (val: number) => {
        let player: WebAudioPlayer | undefined
        musicPlayList.value.forEach((i) => {
            if (listItem.title == i.title) {
                if (player != null) {
                    player = i.players
                }
            }
        })
        if (!player) {
            player = new WebAudioPlayer(listItem)
            musicPlayList.value.forEach((i) => {
                if (listItem.title == i.title) {
                    i.players = player
                }
            })
            player.play()
        }
        player.seek(val)
    }

    /**
     * 设置当前音频播放状态 开始/暂停
     * @param localfile
     */
    const playPause = (localfile: playListItem) => {
        /**
         * 这里2种情况, 会有空文件和非空文件传入
         * 非空情况下需要读取list来播放==>随机判断
         * fix: 设置成外部处理
         */
        listItem = localfile
        let player: WebAudioPlayer | undefined
        musicPlayList.value.forEach((i) => {
            if (localfile.title == i.title) {
                if (player != null) {
                    player = i.players
                }
            }
        })
        if (!player) {
            player = new WebAudioPlayer(localfile)
            musicPlayList.value.forEach((i) => {
                if (localfile.title == i.title) {
                    i.players = player
                }
            })
        }
        if (player.action === true) {
            player.play()
        } else {
            player.stop()
        }
    }

    /**
     * 设置音量大小
     * @param val
     */
    const voice = () => {
        let player: WebAudioPlayer | undefined
        musicPlayList.value.forEach((i) => {
            if (listItem.title == i.title) {
                if (player != null) {
                    player = i.players
                }
            }
        })

        if (player == undefined) return
        player.voice = musicVoice.value
    }

    return {
        playListAdd,
        voice,
        playPause,
    }
}

class WebAudioPlayer {
    private context: AudioContext
    private file: playListItem
    private store = useMusicStore()
    private progressInterval
    // 当前音频长度
    private offset
    private progressFactor
    private start
    private decodePromise
    private audioBuffer!: AudioBuffer | null
    private source: AudioBufferSourceNode | undefined
    private gain: GainNode | undefined

    constructor(file: playListItem) {
        this.file = file
        this.context = new AudioContext()
        this.startProgress()
        this.stopProgress()
        this.decodePromise = this.decode()
    }

    /**
     * 获取播放状态
     */
    get action() {
        const { musicStatus } = storeToRefs(this.store)
        return musicStatus.value
    }

    set action(flag: boolean) {
        const { musicStatus } = storeToRefs(this.store)
        musicStatus.value = flag
    }

    get voice() {
        const { musicVoice } = storeToRefs(this.store)
        return musicVoice.value
    }

    set voice(val: number) {
        this.gain!.gain.value = val
    }

    set musicBarLength(val: number) {
        const { musicBarLength } = storeToRefs(this.store)
        musicBarLength.value = val
    }

    get musiBarLength() {
        const { musicBarLength } = storeToRefs(this.store)
        return musicBarLength.value
    }

    /** 获取文件音频buffer */
    get fileBuffer() {
        return window.api.file.getBufferData(this.file.url)
    }

    private startProgress = () => {
        clearInterval(this.progressInterval)
        this.progressInterval = this.setProgress
    }

    private stopProgress = () => {
        clearInterval(this.progressInterval)
    }

    private setProgress = () => {
        return setInterval(() => {
            if (this.action === false) {
                /**
                 * 需要修改
                 * 理解: 这里应该是获取当前播放时间和总播放时间
                 * currentTime是当前播放时间 time应该是总播放时间
                 * this.progressFactor 是处理浮点数用
                 */
                const currentTime = this.context.getOutputTimestamp().contextTime
                console.log(currentTime)
            }
        }, 100)
    }

    private async decode() {
        // todo: 播放条拖拽锁定
        this.audioBuffer = await this.context
            .decodeAudioData(this.fileBuffer)
            .then((buffer) => {
                return buffer
            })
            .finally(() => {
                // todo: 播放条拖拽解锁
            })
    }

    public seek(val: number) {
        this.stop()
        console.log('seek val: ' + val)
        this.play(/* 获取播放条拖拽的当前长度 */)
    }

    /**
     * 播放方法
     * @todo 添加音量设置
     * @param offset
     */
    public play(offset: number = 0) {
        this.decodePromise.then(() => {
            this.context.resume()
            this.source = this.context.createBufferSource()
            this.gain = this.context.createGain()
            this.source.buffer = this.audioBuffer
            this.gain.gain.value = this.voice * 0.01
            this.source.connect(this.gain)
            this.gain.connect(this.context.destination)
            this.source.start(0, offset)
            this.source.onended = () => {
                // 音频 暂停/结束 事件
                // ...
                this.stop()
            }

            /**
             * 设置bar的默认信息
             * start, offset, length, offset
             */
            // 设置最大长度
            this.musicBarLength = parseInt(this.source.buffer!.duration.toFixed(0))
            this.offset = offset
            /** todo: 需要设置 lengthvalue */

            // ...添加对bar的监听
            this.startProgress()

            // ...设置播放状态
            this.action = false
        })
    }

    public stop() {
        if (this.source) {
            this.source.onended = null
            this.source.stop()
            this.source.disconnect()
        }

        // ...清除对 bar 的监听
        this.stopProgress()
        // ...更新播放状态
    }
}
