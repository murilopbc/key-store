import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as ProfileRepository from '../database/profileRepository';
import { deletePhoto } from '../services/fileService';
import { UserProfile, SaveProfileInput } from '../types/profile';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setProfile(await ProfileRepository.getProfile());
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = useCallback(
    async (input: SaveProfileInput) => {
      const previousPhoto = profile?.photoUri ?? null;
      await ProfileRepository.saveProfile(input);
      if (previousPhoto && previousPhoto !== input.photoUri) deletePhoto(previousPhoto);
      await load();
    },
    [profile, load],
  );

  return { profile, loading, save };
}
