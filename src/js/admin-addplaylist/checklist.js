{
    let view = {
        el: '.right',
        template: `
            <ul class="checklist-wrapper">
            </ul>
        `,
        render(data = {}){
            this.$el.html(this.template)
            if(data.songs){
                let {songs} = data
                songs.map(song=>{
                    let $li = $(`<li>${song.name}</li>`).attr('data-song-id',song.id)
                    $li.append('<span>x</span>')
                    this.$el.find('.checklist-wrapper').append($li)
                })
            } 
        },
        init(){
            this.$el = $(this.el)
        }
    }
    let model = {
        playlist: null,
        data: {
            songs: []
        },
        getSong(songs){
            let promises = []
            songs.map(song=>{
                let {id} = song
                var song = new AV.Query('Song')
                promises.push(
                    song.get(id).then(songInfo=>{
                        this.data.songs.push(songInfo.attributes)
                    })
                )
            })
            return Promise.all(promises)  
        },
        playlistSongs(playlist){
            var song = new AV.Query('Song')
            song.equalTo('dependent', playlist)
            return song.find().then((songs)=>{
                songs.map(song=>{
                    this.data.songs.push(song.attributes)
                })
                return this.data
            })
        },
        deleteSong(songId){
            var song = AV.Object.createWithoutData('Song', songId);
            // 修改属性
            song.set('id',songId)
            song.set('dependent', null);
            // 保存到云端
            return song.save()
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.view.init()
            this.model = model
            this.bindEvent()
            this.bindEventHub()
        },
        bindEvent(){
            this.view.$el.on('click','li>span',(e)=>{
                let $li = $(e.currentTarget).parent()
                let songId = $li.attr('data-song-id')
                this.model.deleteSong(songId).then((data)=>{
                    this.model.data.songs.map((song,index)=>{
                        if(song.id === songId){
                            this.model.data.songs.splice(index,1)
                        }
                    })
                    $li.remove()   
                })
            })
        },
        bindEventHub(){
            window.eventHub.on('select',(song)=>{
                this.model.getSong(song).then((data)=>{
                    this.view.render(this.model.data)
                    // localStorage.setItem('playlist',JSON.stringify(this.model.data))
                })
            })
            window.eventHub.on('contact',(playlist)=>{
                this.model.playlist = playlist
                this.model.playlistSongs(playlist).then(songs=>{
                    this.view.render(songs)
                })
            })
        }
    }
    controller.init(view, model)
}