{
    let view = {
        el: '.page',
        template: `
            
        `,
        init(){
            this.$el = $(this.el)
        },
        render(data){
            let {song,status} = data
            this.musicOne(song)
            this.audioListener(song)
            this.statusJudge(status)
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
        play(){
            this.$el.find('audio')[0].play()
        },
        pause(){
            this.$el.find('audio')[0].pause()
        },
        getCurrentTime(time){
            let allP = this.$el.find('.lines > p')
            for(let i = 0;i<allP.length;i++){
                if(i===allP.length-1){
                    var p = allP[i]
                    break
                }else {
                    var prevtime = allP[i].getAttribute('data-time')
                    var nexttime = allP[i+1].getAttribute('data-time')
                    if(prevtime <= time && time < nexttime){
                        p = allP[i]
                        break
                    }
                }   
            }
            let originalHeight = $(p)[0].getBoundingClientRect().top
            $(p).addClass('active').siblings().removeClass('active')
            let parentHeight = this.$el.find('.lyric> .lines')[0].getBoundingClientRect().top
            let height = parentHeight - originalHeight + 24
            this.lyricMove(height)
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
                let audio = this.$el.find('audio').attr('src',song.url)
                audio.on('ended',()=>{
                    window.eventHub.emit('songEnd')
                })
                audio.on('timeupdate',()=>{
                    this.getCurrentTime(audio[0].currentTime)
                })
            }
        },
        musicOne(song){
            this.$el.find('.page-container').css('background-image',`url(${song.cover})`)
            this.$el.find('.cover').attr('src',song.cover)
            this.$el.find('.song-description > h1').text(`${song.name} - ${song.singer}`)
        },
        lyricMove(height){
            this.$el.find('.lines').css('transform',`translateY(${height}px)`)
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
        init(view, model){
            this.view = view
            this.model = model
            this.view.init()
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
                    var idKey = keyValue[0]
                    id = keyValue[1]
                })
            }
            this.model.data.id = id
        },
        bindEvent(){
            this.view.$el.on('click','.icon-play',()=>{
                this.model.data.status = 'playing'
                this.view.render(this.model.data)
                this.view.play()
            })
            this.view.$el.on('click','.icon-pause',()=>{
                this.model.data.status = 'pause'
                this.view.render(this.model.data)
                this.view.pause()
            })
        },
        bindEventHub(){
            window.eventHub.on('songEnd',()=>{
                this.model.data.status = 'pause'
                this.view.render(this.model.data)
                this.view.lyricMove(24)
            })
        }
    }
    controller.init(view, model)
}