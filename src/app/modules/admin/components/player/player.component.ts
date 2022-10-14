import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnChanges, OnDestroy {
  @Input() playAudio?: any;
  @Output() togglePlaying = new EventEmitter();
  @Output() onClosePlayer = new EventEmitter();
  duration: number = 100;
  currentTime: number = 0;
  readCurrentTime: string = '00:00';
  readDuration: string = '00:00';
  valume = 1;
  isPlay: boolean = false;
  muted: string = 'full';
  playingId: string;

  mydata = {
    img: '',
    label: '',
    auther: ''
  };

  audio: any;
  isDurationDropdown1 = false;
  currentSpeed = '1';

  playBackSpeed(e) {
    this.isDurationDropdown1 = false;
    this.currentSpeed = e;
    this.audio.playbackRate = e;
  }
  constructor() {
    this.audio = new Audio();
  }

  // ngOnInit(): void {
  //   this.audio.src =
  //     'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  //   this.audio.load();
  // }

  agrntName: string = '';
  name: string = '';
  ngOnChanges(changes: SimpleChanges): void {
    this.agrntName = changes.playAudio.currentValue.AgentName;
    this.name = changes.playAudio.currentValue.Name;
    console.log(changes);
    if (changes.playAudio.currentValue.isPlay === false) {
      this.isPlay = false;
      this.audio.pause();
    }
    if (changes.playAudio.currentValue.data) {
      this.playStreaming(
        changes.playAudio.currentValue.data
      ).subscribe(ev => {
      }, err => console.log(err)
      );
    }
  }
@ViewChild('seek') mainSlider
  playStreaming(data) {
    return new Observable(observer => {
      setTimeout(() => {
        this.mainSlider.value = 0;
      }, 50);
      this.audio.src = data;
      this.audio.play();
      this.currentTime = 0;
      this.audio.currentTime = 0;
      this.isPlay = true;
      const handle = (events: Event) => {
        this.currentTime = this.audio.currentTime;
        this.readCurrentTime = this.formateTime(this.currentTime);
        this.duration = this.audio.duration;
        this.readDuration = this.formateTime(this.duration);

        observer.next(events);
      };
      // this.addEvents(this.audio, handle);
      const ended = (events: Event) => {
        this.readCurrentTime = '00:00';
        this.currentTime = 0;
        this.isPlay = false;
        this.togglePlaying.emit(this.isPlay);
      };
      this.audio.addEventListener('ended', ended);
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
      this.setVolumeIcon(value);
    }
  }
  setVolumeIcon(e) {
    if (e < 0.34 && e > 0) {
      this.muted = 'low';
    } else if (e > 0.33 && e < 0.67) {
      this.muted = 'medium';
    } else if (e > 0.66) {
      this.muted = 'full';
    }
  }
  mute() {
    this.audio.volume = 0;
    this.valume = 0;
    this.muted = 'mute';
  }
  Unmute() {
    this.audio.volume = 1;
    this.valume = 1;
    this.muted = 'full';
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

  play() {
    this.isPlay = true;
    this.togglePlaying.emit(this.isPlay);
    this.audio.play();
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
