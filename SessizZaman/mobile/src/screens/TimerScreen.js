import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function TimerScreen() {
  const { refreshUser } = useAuth();
  const [seconds, setSeconds] = useState(25 * 60); // 25 dakika
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState('pomodoro');
  const [treeSize] = useState(new Animated.Value(50));
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 0) {
            handleTimerComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    if (isActive) {
      // Ağaç büyüt
      Animated.timing(treeSize, {
        toValue: 150,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      // Ağacı küçült
      Animated.timing(treeSize, {
        toValue: 50,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [isActive]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    setIsPaused(false);
    
    // Seans tamamlandı
    const duration = sessionType === 'pomodoro' ? 25 * 60 : seconds;
    
    try {
      await api.post('/sessions', {
        user_id: 'temp',
        duration: duration,
        session_type: sessionType,
        completed: true,
        tags: [],
      });
      
      await refreshUser();
      
      Alert.alert('🎉 Tebrikler!', 'Odaklanma seansını tamamladın! Ağacın büyüdü!');
    } catch (error) {
      console.error('Session save error:', error);
    }
    
    // Reset
    if (sessionType === 'pomodoro') {
      setSeconds(5 * 60); // 5 dakika mola
      Alert.alert('☕ Mola Zamanı', '5 dakika mola ver!');
    } else {
      setSeconds(25 * 60);
    }
  };

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const stopTimer = () => {
    Alert.alert(
      '⚠️ Dur',
      'Odaklanmayı bırakırsan ağacın kuruyacak. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Durdur',
          style: 'destructive',
          onPress: async () => {
            setIsActive(false);
            setIsPaused(false);
            
            // Kayıt et ama tamamlanmadı olarak
            try {
              await api.post('/sessions', {
                user_id: 'temp',
                duration: (25 * 60) - seconds,
                session_type: sessionType,
                completed: false,
                tags: [],
              });
            } catch (error) {
              console.error('Session save error:', error);
            }
            
            setSeconds(25 * 60);
          },
        },
      ]
    );
  };

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const changeSessionType = (type) => {
    if (isActive) {
      Alert.alert('Hata', 'Oturum devam ederken tür değiştiremezsiniz');
      return;
    }
    setSessionType(type);
    if (type === 'pomodoro') {
      setSeconds(25 * 60);
    } else if (type === 'short') {
      setSeconds(15 * 60);
    } else {
      setSeconds(50 * 60);
    }
  };

  return (
    <View style={styles.container}>
      {/* Session Type Selector */}
      <View style={styles.typeSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            sessionType === 'pomodoro' && styles.typeButtonActive,
          ]}
          onPress={() => changeSessionType('pomodoro')}
        >
          <Text
            style={[
              styles.typeButtonText,
              sessionType === 'pomodoro' && styles.typeButtonTextActive,
            ]}
          >
            Pomodoro (25d)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            sessionType === 'short' && styles.typeButtonActive,
          ]}
          onPress={() => changeSessionType('short')}
        >
          <Text
            style={[
              styles.typeButtonText,
              sessionType === 'short' && styles.typeButtonTextActive,
            ]}
          >
            Kısa (15d)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            sessionType === 'long' && styles.typeButtonActive,
          ]}
          onPress={() => changeSessionType('long')}
        >
          <Text
            style={[
              styles.typeButtonText,
              sessionType === 'long' && styles.typeButtonTextActive,
            ]}
          >
            Uzun (50d)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tree Animation */}
      <Animated.View style={[styles.treeContainer, { height: treeSize }]}>
        <Text style={[styles.tree, { fontSize: treeSize }]}>
          {isActive ? '🌳' : '🌱'}
        </Text>
      </Animated.View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <Text style={styles.timerLabel}>
          {isActive ? 'Odaklanıyorun...' : 'Başlamaya Hazır'}
        </Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startTimer}>
            <Text style={styles.startButtonText}>Başlat</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            {!isPaused ? (
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={pauseTimer}
              >
                <Text style={styles.pauseButtonText}>Duraklat</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.resumeButton}
                onPress={resumeTimer}
              >
                <Text style={styles.resumeButtonText}>Devam Et</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
              <Text style={styles.stopButtonText}>Durdur</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info */}
      <Text style={styles.infoText}>
        {isActive
          ? '🚨 Uygulamadan çıkarsan ağacın kurur!'
          : '🌱 Odaklan ve ağacını büyüt'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 20,
    justifyContent: 'space-around',
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dcfce7',
  },
  typeButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  typeButtonText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  tree: {
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#166534',
  },
  timerLabel: {
    fontSize: 18,
    color: '#4ade80',
    marginTop: 10,
  },
  controls: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  activeControls: {
    flexDirection: 'row',
    gap: 15,
  },
  pauseButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resumeButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    textAlign: 'center',
    color: '#16a34a',
    fontSize: 14,
    marginTop: 20,
  },
});
