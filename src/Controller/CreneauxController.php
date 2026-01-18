<?php

namespace App\Controller;

use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

final class CreneauxController extends AbstractController
{
    #[Route('/creneaux', name: 'app_creneaux')]
    public function index(Request $request, EntityManagerInterface $em): Response
    {
        $tz = new \DateTimeZone('Europe/Paris');

        // Date sélectionnée
        $dateParam = $request->query->get('date'); // YYYY-MM-DD
        $dateObj = $dateParam
            ? \DateTime::createFromFormat('Y-m-d', $dateParam, $tz)
            : new \DateTime('tomorrow', $tz);

        if (!$dateObj) {
            throw new \Exception("Date invalide : $dateParam");
        }

        $startOfDay = (clone $dateObj)->setTime(0, 0, 0);
        $endOfDay   = (clone $dateObj)->setTime(23, 59, 59);

        // Récupération des réservations du jour
        $reservedReservations = $em->getRepository(Reservation::class)
            ->createQueryBuilder('r')
            ->andWhere('r.dateDebut BETWEEN :start AND :end')
            ->setParameter('start', $startOfDay)
            ->setParameter('end', $endOfDay)
            ->getQuery()
            ->getResult();

        // Créneaux réservés envoyés au front
        $reservedSlots = [];

        foreach ($reservedReservations as $reservation) {
            $reservedSlots[] = [
                'start'    => $reservation->getDateDebut()
                    ->setTimezone($tz)
                    ->format('Y-m-d H:i'),
                'end'      => $reservation->getDateFin()
                    ->setTimezone($tz)
                    ->format('Y-m-d H:i'),
                'duration' => $reservation->getDureeMinutes(),
                'client'   => $reservation->getPrenomClient() . ' ' . $reservation->getNomClient(),
            ];

        }

        // Créneaux standards pour le front
        $allSlots = ['08:00','09:15','10:30','14:00','15:30','17:00','18:30'];

        return $this->render('creneaux/index.html.twig', [
            'reservedSlots' => $reservedSlots,
            'allSlots'      => $allSlots,
            'selectedDate'  => $dateObj->format('Y-m-d'),
        ]);
    }
}
