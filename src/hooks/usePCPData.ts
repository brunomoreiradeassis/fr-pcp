
import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PCPData, ProdutoData, MetasData } from '@/types/pcp';
import { useToast } from '@/hooks/use-toast';

export const usePCPData = () => {
  const [pcpData, setPcpData] = useState<PCPData[]>([]);
  const [produtos, setProdutos] = useState<ProdutoData[]>([]);
  const [metas, setMetas] = useState<MetasData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Listener para dados PCP
    const pcpQuery = query(collection(db, 'PCP'), orderBy('createdAt', 'desc'));
    const unsubscribePCP = onSnapshot(pcpQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as PCPData[];
      setPcpData(data);
      setLoading(false);
    });

    // Listener para produtos
    const produtosQuery = query(collection(db, 'produtos'), orderBy('codigo'));
    const unsubscribeProdutos = onSnapshot(produtosQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as ProdutoData[];
      setProdutos(data);
    });

    // Listener para metas
    const metasQuery = query(collection(db, 'metas'));
    const unsubscribeMetas = onSnapshot(metasQuery, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setMetas({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        } as MetasData);
      }
    });

    return () => {
      unsubscribePCP();
      unsubscribeProdutos();
      unsubscribeMetas();
    };
  }, []);

  const addPCPData = async (data: Omit<PCPData, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'PCP'), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast({
        title: "Sucesso",
        description: "Dados do PCP adicionados com sucesso!"
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar dados PCP:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar dados do PCP",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePCPData = async (id: string, data: Partial<PCPData>) => {
    try {
      await updateDoc(doc(db, 'PCP', id), {
        ...data,
        updatedAt: new Date()
      });
      toast({
        title: "Sucesso",
        description: "Dados do PCP atualizados com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar dados PCP:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar dados do PCP",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addProduto = async (produto: Omit<ProdutoData, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'produtos'), {
        ...produto,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!"
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar produto",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMetas = async (metasData: Omit<MetasData, 'id'>) => {
    try {
      if (metas?.id) {
        await updateDoc(doc(db, 'metas', metas.id), {
          ...metasData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'metas'), {
          ...metasData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      toast({
        title: "Sucesso",
        description: "Metas atualizadas com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar metas:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar metas",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    pcpData,
    produtos,
    metas,
    loading,
    addPCPData,
    updatePCPData,
    addProduto,
    updateMetas
  };
};
