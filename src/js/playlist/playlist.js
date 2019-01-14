{
    let view = {
        el: '.playlist',
        init(){
            this.$el = $(this.el)
            this.$top = this.$el.find('.top')
        },
        playlistInit(data){
            let {playlist} = data
            let {name,summary,cover} = playlist
            let $img = $(`<img>`).attr('src',cover)
            this.$top.find('.left').append($img)
            let $p = $(`
            <p>${name}</p>
            <p>${summary}</p>
            `)
            this.$top.find('.right').append($p)
        },
        allSongsInit(data){
            let {songs} = data
            songs.map(song=>{
                let $li = $(`
                <li>
                  <h3>${song.name}</h3>
                  <p>
                    <svg class="icon icon-sq">
                      <use xlink:href="#icon-sq"></use>
                    </svg>
                    ${song.singer}
                  </p>
                  <a class="playButton" href="./song.html?id=${song.id}">
                    <svg class="icon icon-play">
                      <use xlink:href="#icon-play"></use>
                    </svg>
                  </a>
                </li>
                `)
                this.$el.find('.list').append($li)
            })
        },
        render(data){
            this.playlistInit(data)
            this.allSongsInit(data)
        }
    }
    let model = {
        data: {
            playlist: {
                id: '',
                name: '',
                summary: '',
                cover: ''
            },
            songs: []
        },
        getPlaylist(id){
            var query = new AV.Query('Playlist');
            return query.get(id).then((playlist)=>{
                Object.assign(this.data.playlist,playlist.attributes)
                return this.data 
            })
        },
        getplaylistId(){
            let search = window.location.search.substring(1)
            let key = search.split('=')
            let id = key[1]
            this.data.playlist.id = id
        },
        getAllSongs(id){
            var playlist = AV.Object.createWithoutData('Playlist', id)
            var song = new AV.Query('Song')
            song.equalTo('dependent', playlist)
            return song.find().then((songs=>{
                this.data.songs = songs.map(song=>{
                    return {id:song.id,...song.attributes}
                })
                return this.data.songs
            }))
        },
        getPlaylistAndSongs(id){
            let promise1 = this.getPlaylist(id)
            let promise2 = this.getAllSongs(id)
            return Promise.all([promise1,promise2])
        }
    }
    let controller = {
        id: '',
        init(view, model){
            this.view = view
            this.view.init()
            this.model = model
            this.model.getplaylistId()
            this.id = this.model.data.playlist.id
            this.asycModel()
        },
        asycModel(){
            this.model.getPlaylistAndSongs(this.id).then((data)=>{
                Object.assign(this.model.data,data[0])
                console.log(this.model.data)
                this.view.render(this.model.data)
            })
        }

    }
    controller.init(view, model)
}