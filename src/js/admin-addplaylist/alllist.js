{
    let view = {
        el: '.addplaylist-wrapper',
        init(){
            this.$el = $(this.el)
        },
        render(data){
            let {songs} = data
            songs.map(song=>{
                let line = $(`
                <div class="row">
                    <label><input type="checkbox" data-song-id="${song.id}"><span>${song.name}</span></label>
                </div>
                `)
                this.$el.find('.addplaylist').prepend(line)
            })
        }
    }
    let model = {
        playlist: '',
        data: {
            songs: [],
            playlistSongs: []
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
        getSong(id){
            var song = new AV.Query('Song');
            return song.get(id)
        },
        getPlaylist(){
            let search = window.location.search.substring(1)
            let key = search.split('=')
            let id = key[1]
            this.playlist = AV.Object.createWithoutData('playList', id) 
        },
        updata(songId){
            var song = AV.Object.createWithoutData('Song', songId);
            // 修改属性
            song.set('id',songId)
            song.set('dependent', this.playlist);
            // 保存到云端
            return song.save().then(data=>{
                this.data.playlistSongs.push(data)
            })
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.view.init()
            this.model = model
            this.model.getPlaylist()
            this.model.find().then(songs=>{
                Object.assign(this.model.data.songs,songs)
                this.view.render(this.model.data)
                window.eventHub.emit('contact',this.model.playlist)
            })
            this.bindEvent()
        },
        bindEvent(){
            let songsId = []
            this.view.$el.on('click','input',(e)=>{
                let current = $(e.currentTarget)
                let currentId = current.attr('data-song-id')
                this.model.getSong(currentId).then(data=>{
                    let dependent = data.attributes.dependent
                    if(dependent && dependent.id === this.model.playlist.id){
                        return
                    }else {
                        if(current.prop('checked') === true){
                            songsId.push(currentId)
                        }else{
                            songsId.pop(currentId)
                        }
                    }
                }) 
            })
            this.view.$el.on('submit','.addplaylist',(e)=>{
                e.preventDefault()
                let promise = []
                songsId.map(songId=>{
                    promise.push(this.model.updata(songId))
                })
                Promise.all(promise).then(()=>{
                    let playlist = this.model.data.playlistSongs
                    window.eventHub.emit('select',playlist)
                    songsId = []
                    this.model.data.playlistSongs = []
                })
                this.view.$el.find('.addplaylist > .row > label> input').prop('checked',false)
            })
        }
    }
    controller.init(view, model)
}