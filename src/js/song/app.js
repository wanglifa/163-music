{
    let view = {
        el: '.page',
        template: `
            
        `,
        init(){
            this.$el = $(this.el)
            this.audio = this.$el.find('audio')
        },
        render(data){
            let {song,status} = data
            this.musicOne(song)
            this.audioListener(song)
            let {lyric} = song
            lyric.split('\n').map(string=>{
                let textTimer = string.match(/\[[\d:.]+\]/)
                let time = textTimer[0].match(/[\d:.]+/)[0]
                let text = string.replace(`[${time}]`,'')
                let $p = $('<p></p>').text(text)
                this.$el.find('.lines').append($p)
                let minuterSecond = time.split(':')
                let [minuter,second] = minuterSecond
                second = parseFloat(minuter) * 60 + parseFloat(second)
                $p.attr('data-time',second)
            })  
        },
        renderStatus(data){
            let {status} = data
            this.statusJudge(status)
        },
        play(){
            this.$el.find('audio')[0].play()
        },
        pause(){
            this.$el.find('audio')[0].pause()
        },
        getCurrentTime(){
            this.time = this.audio[0].currentTime
            this.timeFormat()
            this.$el.find('.current-time').text(this.time)   
        },
        lyricProgress(time){
            this.getCurrentLyric(time)
            let originalHeight = $(this.p)[0].getBoundingClientRect().top
            $(this.p).addClass('active').siblings().removeClass('active')
            let parentHeight = this.$el.find('.lyric> .lines')[0].getBoundingClientRect().top
            let height = parentHeight - originalHeight + 56
            this.lyricMove(height)
        },
        getCurrentLyric(time){
            let allP = this.$el.find('.lines > p')
            for(let i = 0;i<allP.length;i++){
                if(i===allP.length-1){
                    this.p = allP[i]
                    break
                }else {
                    var prevtime = allP[i].getAttribute('data-time')
                    var nexttime = allP[i+1].getAttribute('data-time')
                    if(prevtime <= time && time < nexttime){
                        this.p = allP[i]
                        break
                    }
                }   
            }
        },
        timeFormat(){
            let minuter = parseInt(this.time / 60)
            let second = Math.floor(this.time % 60)
            minuter = (minuter < 10) ? ('0' + minuter) : minuter
            second = (second < 10) ? ('0' + second) : second
            this.time = `${minuter}:${second}` 
        },
        statusJudge(status){
            if(status === 'playing'){
                this.$el.find('.disc-container').addClass('playing')
            }else{
                this.$el.find('.disc-container').removeClass('playing')
            }
        },
        audioListener(song){
            //重新渲染的时候如果audio里的src是#就让它等于当前的song.url否则，就不去重新渲染
            if(this.$el.find('audio').attr('src') !== song.url){
                this.audio = this.$el.find('audio').attr('src',song.url)
                this.audio.on('canplay',()=>{
                    this.getSongLength()
                })
                this.audio.on('ended',()=>{
                    window.eventHub.emit('songEnd')
                })
                this.audio.on('timeupdate',()=>{
                    this.updateProgress()
                    this.lyricProgress(this.audio[0].currentTime)
                    
                })
            }
        },
        getSongLength(){
            this.time = this.audio[0].duration
            this.timeFormat()
            this.$el.find('.songs-time').text(this.time)
        },
        musicOne(song){
            this.$el.find('.page-container').css('background-image',`url(${song.cover})`)
            this.$el.find('.cover').attr('src',song.cover)
            this.$el.find('.song-description > h1').text(`${song.name} - ${song.singer}`)
        },
        lyricMove(height){
            this.$el.find('.lines').css('transform',`translateY(${height}px)`)
        },
        updateProgress(){
            this.value = this.audio[0].currentTime / this.audio[0].duration
            this.$el.find('.progress-top').css('width',`${this.value * 100}%`)
            this.$el.find('.progress-dot').css('left',`${this.value * 100}%`)
            this.getCurrentTime()
        },
        audioEnd(){
            this.$el.find('.progress-top').css('width',0)
            this.$el.find('.progress-dot').css('left',0)
            this.$el.find('.current-time').text('00:00')
        },
        playProgress(){

        }
        
    }
    let model = {
        data: {
            song: {
                id: '',
                name: '',
                singer: '',
                url: '',
                cover: '',
                lyric: ''
            },
            status: 'pause'
        },
        getSong(id){
            var song = new AV.Query('Song')
            return song.get(id).then(data=>{
                Object.assign(this.data.song,data.attributes)
                return this.data
            })
        }
    }
    let controller = {
        flag: false,
        $document: null,
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
            this.$document = $(document)
            this.getId()
            this.model.getSong(this.model.data.id)
                .then(()=>{
                    this.view.render(this.model.data)
                })
            this.bindEvent()  
            this.bindEventHub()  
        },
        getId(){
            let search = window.location.search
            let id = ''
            if(search){
                var idOne = search.substring(1).split('&')
                idOne.map(list=>{
                    var keyValue = list.split('=')
                    id = keyValue[1]
                })
            }
            this.model.data.id = id
        },
        preventDefaultEvent(){
            // 禁止默认事件（避免鼠标拖拽进度点的时候选中文字）
            if (this.event && this.event.preventDefault) {
                this.event.preventDefault();
            } else {
                this.event.returnValue = false;
            }
            // 禁止事件冒泡
            if (this.event && this.event.stopPropagation) {
                this.event.stopPropagation();
            } else {
                window.event.cancelBubble = true;
            }
        },
        down(e){
            this.flag = true
            this.event = e || window.event
            this.clientX = this.event.touches ? this.event.touches[0].clientX : this.event.clientX
            this.dot = this.view.$el.find('.progress-dot')[0]
            this.progress = this.view.$el.find('.progress-bottom')[0]
            this.left = this.clientX - this.dot.offsetLeft
            this.preventDefaultEvent()
            
        },
        moveLength(){
            this.maxRightLength = this.progress.offsetWidth
            if(this.left1 < 0){
                this.left1 = 0
            }else if(this.left1 > this.maxRightLength){
                this.left1 = this.maxRightLength
            }
        },
        move(e){
            this.event = e || window.event
            if(this.flag){
                this.clientX = this.event.touches ? this.event.touches[0].clientX : this.event.clientX
                this.left1 = this.clientX - this.left
                this.moveLength()
                this.motalLeft = this.left1/this.progress.offsetWidth
                let audio = this.view.$el.find('audio')[0]
                audio.currentTime = this.motalLeft *audio.duration
            }
        },
        end(){
            this.flag = false
        },
        bindEvent(){
            this.view.$el.on('click','.icon-play',()=>{
                this.model.data.status = 'playing'
                this.view.renderStatus(this.model.data)
                this.view.play()
            })
            this.view.$el.on('click','.icon-pause',()=>{
                this.model.data.status = 'pause'
                this.view.renderStatus(this.model.data)
                this.view.pause()
            })
            this.view.$el.on('mousedown','.progress-bottom',(e)=>{
                this.current = $(e.currentTarget)
                let left = e.offsetX
                let motallength = this.current.width()
                let audio = this.view.$el.find('audio')[0]
                audio.currentTime = audio.duration * (left/motallength)
            })
            this.view.$el.on('mousedown','.progress-dot',this.down.bind(this))
            this.view.$el.on('touchstart','.progress-dot',this.down.bind(this))
            this.$document.on('mousemove','.progress-dot',this.move.bind(this))
            this.$document.on('touchmove','.progress-dot',this.move.bind(this))
            this.$document.on('mouseup','.progress-dot',this.end.bind(this))
            this.$document.on('touchend','.progress-dot',this.end.bind(this))
        },
        bindEventHub(){
            window.eventHub.on('songEnd',()=>{
                this.model.data.status = 'pause'
                this.view.renderStatus(this.model.data.status)
                this.view.lyricMove(56)
                this.view.audioEnd()
            })
        }
    }
    controller.init(view, model)
}