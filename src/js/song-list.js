{
    let view = {
        el: '#songList-wrapper',
        template: `
            <ul class="songList">
            </ul>
        `,
        render(data){
            let $el = $(this.el)
            $el.html(this.template)
            let {songs,songsSelectId} = data
            let liList = songs.map((song)=>{
                let $li = $(`<li></li>`).text(song.name).attr('data-song-id',song.id)
                if(song.id === songsSelectId){
                    $li.addClass('active')
                }
                $li.append('<span>x</span>')
                return $li
            })
            liList.map((domLi)=>{
                $el.find('ul').append(domLi)
            })
        },
        clearActive(){
            $(this.el).find('.active').removeClass('active')
        }
    }
    let model = {
        data: {
            songs: [],
            songsSelectId: ''
        },
        find(){
            var query = new AV.Query('Song')
            return query.find().then((songs)=>{
                this.data.songs = songs.map((song)=>{
                    return {id:song.id,...song.attributes}
                })
                return this.data.songs
            })
        },
        delete(songId){
            var song = AV.Object.createWithoutData('Song', songId)
            let songs = this.data.songs
            return song.destroy().then((res)=>{
                songs.map((song,index)=>{
                    if(song.id === res.id){
                        songs.splice(index,1)
                    }
                })
                return songs
            })
        }
    }
    let controller = {
        view: null,
        model: null,
        init(view, model){
            this.view = view
            this.model = model
            this.model.find().then((res)=>{
                this.view.render(this.model.data)
            })
            this.view.render(this.model.data)
            this.bindEvent()
            this.bindEventHub()
        },
        bindEvent(){
            $(this.view.el).on('click','li',(e)=>{
                let songId = $(e.currentTarget).attr('data-song-id')
                this.model.data.songsSelectId = songId
                let song = this.model.data.songs
                this.view.render(this.model.data)
                let data
                for(let i=0;i<song.length;i++){
                    if(song[i].id === songId){
                        data= song[i]
                        break
                    }
                }
                window.eventHub.emit('select',JSON.parse(JSON.stringify(data)))
            })
            $(this.view.el).on('click','span',(e)=>{
                let li = $(e.currentTarget).parent('li')
                let songId = li.attr('data-song-id')
                this.model.delete(songId).then((songs)=>{
                    this.model.data.songs = songs
                    this.view.render(this.model.data)
                })  
            })
        },
        bindEventHub(){
            window.eventHub.on('create',(data)=>{
                this.model.data.songs.push(data)
                this.view.render(this.model.data)
            })
            window.eventHub.on('new',(data)=>{
                this.model.data.songsSelectId = ''
                this.view.render(this.model.data)
            })
            window.eventHub.on('update',(data)=>{
                let songs = this.model.data.songs
                for(let i =0;i<songs.length;i++){
                    if(songs[i].id === data.id){
                        Object.assign(songs[i],data)
                        break
                    }
                }
                this.view.render(this.model.data)
            })
        }
    }
    controller.init.call(controller, view, model)
}