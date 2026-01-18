<?php

namespace App\Repository;

use App\Entity\Reservation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Reservation>
 */
class ReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

    /**
     * Retourne toutes les réservations pour une date donnée
     *
     * @param \DateTimeInterface $date
     * @return Reservation[]
     */
    public function findReservationsByDate(\DateTimeInterface $date): array
    {
        $start = (clone $date)->setTime(0, 0, 0);
        $end = (clone $date)->setTime(23, 59, 59);

        return $this->createQueryBuilder('r')
            ->andWhere('r.dateDebut BETWEEN :start AND :end')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('r.dateDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }


}
