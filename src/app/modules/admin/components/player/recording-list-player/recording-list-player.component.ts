import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-recording-list-player',
  templateUrl: './recording-list-player.component.html',
  styleUrls: ['./recording-list-player.component.scss?=time()'],
})
export class RecordingListPlayerComponent implements OnChanges, OnDestroy {
  @Input() playAudio?: any;
  isDurationDropdown1 = false;
  @Output() togglePlaying = new EventEmitter();
  @Output() onClosePlayer = new EventEmitter();
  duration: number = 100;
  currentSpeed = '1';
  currentTime: number = 0;
  readCurrentTime: string = '00:00';
  readDuration: string = '00:00';
  valume = 1;
  isPlay: boolean = false;
  muted: boolean = false;
  playingId: string;

  mydata = {
    img: '',
    label: '',
    auther: '',
  };

  audio: any;
  playBackSpeed(e) {
    this.isDurationDropdown1 = false;
    this.currentSpeed = e;
    this.audio.playbackRate = e;
  }

  constructor() {
    this.audio = new Audio();
  }

  ngOnInit(): void {
    this.audio.src =
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    this.audio.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (changes.playAudio.currentValue.isPlay === false) {
      this.isPlay = false;
      this.audio.pause();
    }
    if (changes.playAudio.currentValue.data) {
      this.playStreaming(changes.playAudio.currentValue.data).subscribe(
        (ev) => {}
      );
    }
  }

  playStreaming(data) {
    return new Observable((observer) => {
      this.audio.src = data;
      this.audio.play();
      this.isPlay = true;
      const handle = (events: Event) => {
        this.currentTime = this.audio.currentTime;
        this.readCurrentTime = this.formateTime(this.currentTime);
        this.duration = this.audio.duration;
        this.readDuration = this.formateTime(this.duration);

        observer.next(events);
      };
      // this.addEvents(this.audio, handle);
      this.audio.addEventListener('ended', handle);
      this.audio.addEventListener('error', handle);
      this.audio.addEventListener('play', handle);
      this.audio.addEventListener('playing', handle);
      this.audio.addEventListener('timeupdate', handle);
      this.audio.addEventListener('canplay', handle);
      this.audio.addEventListener('loadedmetadata', handle);
      this.audio.addEventListener('loadstart', handle);
    });
  }

  formateTime(time, formate = 'mm:ss') {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(formate);
  }

  setSeek(value) {
    console.log(value);

    this.audio.currentTime = value;
  }

  isStart() {
    return true;
  }

  setVolume(value) {
    if (value == 0) {
      this.mute();
    } else {
      this.audio.volume = value;
      this.valume = value;
      this.muted = false;
    }
  }
  mute() {
    this.audio.volume = 0;
    this.valume = 0;
    this.muted = true;
  }
  Unmute() {
    this.audio.volume = 1;
    this.valume = 1;
    this.muted = false;
  }
  previous() {
    this.audio.currentTime -= 10;
  }

  pause() {
    this.isPlay = false;
    this.togglePlaying.emit(this.isPlay);
    this.audio.pause();
  }

  next() {
    // this.audio.next();
    this.audio.currentTime += 10;
  }

  ply = 1;
  play() {
    if (this.ply === 1) {
      this.playStreaming(
        'https://www.rmp-streaming.com/media/big-buck-bunny-360p.mp4'
      ).subscribe(() => {});
      this.ply++;
    } else {
      this.audio.play();
    }
    this.isPlay = true;

    // this.togglePlaying.emit(this.isPlay)
    // this.audio.play();
  }

  stop() {}

  isEnd() {
    return false;
  }
  onClose(): void {
    this.onClosePlayer.emit(false);
    this.audio.pause();
  }
  ngOnDestroy(): void {
    this.audio.pause();
  }
}
